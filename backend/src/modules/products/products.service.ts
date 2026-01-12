import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductDetail, Review } from '../../entities';
import { ProductQueryDto, PaginatedResponse } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) { }

  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, categoryId, search, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'DESC', inStock } = query;
    const skip = (page - 1) * limit;

    const qb = this.productRepository.createQueryBuilder('product');

    // Apply filters
    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.author) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStock !== undefined) {
      qb.andWhere('product.inStock = :inStock', { inStock });
    }

    // Apply sorting
    if (sortBy === 'ratingsAvg') {
      qb.leftJoin('product.detail', 'detail');
      qb.orderBy('detail.ratingsAvg', sortOrder);
    } else {
      qb.orderBy(`product.${sortBy}`, sortOrder);
    }

    // Get total count
    const total = await qb.getCount();

    // Apply pagination
    qb.skip(skip).take(limit);

    const data = await qb.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['detail', 'reviews', 'category'],
    });
  }

  async findBySourceId(sourceId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { sourceId },
      relations: ['detail', 'reviews'],
    });
  }

  async findBySourceUrl(sourceUrl: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { sourceUrl },
      relations: ['detail', 'reviews'],
    });
  }

  async upsertProduct(data: Partial<Product>): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { sourceId: data.sourceId },
    });

    if (existing) {
      await this.productRepository.update(existing.id, {
        ...data,
        lastScrapedAt: new Date(),
      });
      const updated = await this.productRepository.findOne({ where: { id: existing.id } });
      if (!updated) throw new Error('Failed to find updated product');
      return updated;
    }

    const product = this.productRepository.create({
      ...data,
      lastScrapedAt: new Date(),
    });
    return this.productRepository.save(product);
  }

  async upsertProductDetail(productId: string, data: Partial<ProductDetail>): Promise<ProductDetail> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    const existing = await this.productDetailRepository.findOne({
      where: { product: { id: productId } },
    });

    if (existing) {
      await this.productDetailRepository.update(existing.id, data);
      const updated = await this.productDetailRepository.findOne({ where: { id: existing.id } });
      if (!updated) throw new Error('Failed to find updated product detail');
      return updated;
    }

    const detail = this.productDetailRepository.create({
      ...data,
      product: product,
    });
    return this.productDetailRepository.save(detail);
  }

  async addReviews(productId: string, reviews: Partial<Review>[]): Promise<Review[]> {
    const savedReviews: Review[] = [];

    for (const reviewData of reviews) {
      const review = this.reviewRepository.create({
        ...reviewData,
        productId,
      });
      savedReviews.push(await this.reviewRepository.save(review));
    }

    // Update review count in product detail
    const count = await this.reviewRepository.count({ where: { productId } });
    const detail = await this.productDetailRepository.findOne({ where: { product: { id: productId } } });
    if (detail) {
      await this.productDetailRepository.update(detail.id, { reviewsCount: count });
    }

    return savedReviews;
  }

  async getRecommendedProducts(productId: string): Promise<Product[]> {
    const detail = await this.productDetailRepository.findOne({
      where: { product: { id: productId } },
    });

    if (!detail || !detail.recommendedProductIds?.length) {
      // Return random products from same category as fallback
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (product?.categoryId) {
        return this.productRepository.find({
          where: { categoryId: product.categoryId },
          take: 6,
        });
      }
      return [];
    }

    return this.productRepository
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids: detail.recommendedProductIds })
      .getMany();
  }

  async needsRefresh(sourceId: string, ttlHours: number = 24): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { sourceId },
    });

    if (!product || !product.lastScrapedAt) {
      return true;
    }

    const hoursSinceLastScrape =
      (Date.now() - product.lastScrapedAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastScrape > ttlHours;
  }
}
