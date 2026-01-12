/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product, ProductDetail, Review } from '../../entities';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: jest.Mocked<Repository<Product>>;
   
  let _detailRepo: jest.Mocked<Repository<ProductDetail>>;
   
  let _reviewRepo: jest.Mocked<Repository<Review>>;

  const mockProduct: Partial<Product> = {
    id: 'test-id-1',
    sourceId: 'test-source-1',
    title: 'Test Book',
    author: 'Test Author',
    price: 9.99,
    currency: 'GBP',
    sourceUrl: 'https://example.com/test',
    inStock: true,
  };

  // Used for future tests - keeping for extensibility
   
  const _mockProductDetail: Partial<ProductDetail> = {
    id: 'detail-id-1',
    description: 'Test description',
    isbn: '1234567890',
    format: 'Paperback',
    publisher: 'Test Publisher',
  };

  beforeEach(async () => {
    const mockProductRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      })),
    };

    const mockDetailRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockReviewRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductDetail),
          useValue: mockDetailRepository,
        },
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get(getRepositoryToken(Product));
    _detailRepo = module.get(getRepositoryToken(ProductDetail));
    _reviewRepo = module.get(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should apply search filter', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
      });

      // Verify createQueryBuilder was called to build the query
      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return product with relations', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct as Product);

      const result = await service.findById('test-id-1');

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        relations: ['detail', 'reviews', 'category'],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should return null for non-existent product', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySourceId', () => {
    it('should find product by source ID', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct as Product);

      const result = await service.findBySourceId('test-source-1');

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { sourceId: 'test-source-1' },
        relations: ['detail', 'reviews'],
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('upsertProduct', () => {
    it('should update existing product', async () => {
      productRepo.findOne.mockResolvedValueOnce(mockProduct as Product);
      productRepo.findOne.mockResolvedValueOnce({
        ...mockProduct,
        title: 'Updated',
      } as Product);

      const result = await service.upsertProduct({
        sourceId: 'test-source-1',
        title: 'Updated',
      });

      expect(productRepo.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated');
    });

    it('should create new product if not exists', async () => {
      productRepo.findOne.mockResolvedValue(null);
      productRepo.create.mockReturnValue(mockProduct as Product);
      productRepo.save.mockResolvedValue(mockProduct as Product);

      await service.upsertProduct({
        sourceId: 'new-source',
        title: 'New Book',
      });

      expect(productRepo.create).toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalled();
    });
  });

  describe('needsRefresh', () => {
    it('should return true for non-existent product', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const result = await service.needsRefresh('non-existent');

      expect(result).toBe(true);
    });

    it('should return true for stale product', async () => {
      const staleProduct = {
        ...mockProduct,
        lastScrapedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      };
      productRepo.findOne.mockResolvedValue(staleProduct as Product);

      const result = await service.needsRefresh('test-source-1', 24);

      expect(result).toBe(true);
    });

    it('should return false for fresh product', async () => {
      const freshProduct = {
        ...mockProduct,
        lastScrapedAt: new Date(), // Now
      };
      productRepo.findOne.mockResolvedValue(freshProduct as Product);

      const result = await service.needsRefresh('test-source-1', 24);

      expect(result).toBe(false);
    });
  });
});
