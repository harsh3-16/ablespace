import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../entities';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            order: { displayOrder: 'ASC', title: 'ASC' },
        });
    }

    async findByNavigationId(navigationId: string): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { navigationId, parentId: IsNull() },
            order: { displayOrder: 'ASC', title: 'ASC' },
        });
    }

    async findBySlug(slug: string): Promise<Category | null> {
        return this.categoryRepository.findOne({
            where: { slug },
            relations: ['children', 'navigation', 'products'],
        });
    }

    async findById(id: string): Promise<Category | null> {
        return this.categoryRepository.findOne({
            where: { id },
            relations: ['children', 'navigation', 'products'],
        });
    }

    async findSubcategories(parentId: string): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { parentId },
            order: { displayOrder: 'ASC', title: 'ASC' },
        });
    }

    async upsert(data: Partial<Category>): Promise<Category> {
        const existing = await this.categoryRepository.findOne({
            where: { slug: data.slug, navigationId: data.navigationId },
        });

        if (existing) {
            await this.categoryRepository.update(existing.id, {
                ...data,
                lastScrapedAt: new Date(),
            });
            const updated = await this.categoryRepository.findOne({ where: { id: existing.id } });
            if (!updated) throw new Error('Failed to find updated category');
            return updated;
        }

        const category = this.categoryRepository.create({
            ...data,
            lastScrapedAt: new Date(),
        });
        return this.categoryRepository.save(category);
    }

    async upsertMany(items: Partial<Category>[]): Promise<Category[]> {
        const results: Category[] = [];
        for (const item of items) {
            const result = await this.upsert(item);
            results.push(result);
        }
        return results;
    }

    async updateProductCount(categoryId: string, count: number): Promise<void> {
        await this.categoryRepository.update(categoryId, { productCount: count });
    }

    async needsRefresh(slug: string, ttlHours: number = 24): Promise<boolean> {
        const category = await this.categoryRepository.findOne({
            where: { slug },
        });

        if (!category || !category.lastScrapedAt) {
            return true;
        }

        const hoursSinceLastScrape =
            (Date.now() - category.lastScrapedAt.getTime()) / (1000 * 60 * 60);

        return hoursSinceLastScrape > ttlHours;
    }
}
