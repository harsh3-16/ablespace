import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from '../../entities';

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);

  constructor(
    @InjectRepository(Navigation)
    private readonly navigationRepository: Repository<Navigation>,
  ) {}

  async findAll(): Promise<Navigation[]> {
    return this.navigationRepository.find({
      order: { displayOrder: 'ASC', title: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Navigation | null> {
    return this.navigationRepository.findOne({
      where: { slug },
      relations: ['categories'],
    });
  }

  async findById(id: string): Promise<Navigation | null> {
    return this.navigationRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  async upsert(data: Partial<Navigation>): Promise<Navigation> {
    const existing = await this.navigationRepository.findOne({
      where: { slug: data.slug },
    });

    if (existing) {
      await this.navigationRepository.update(existing.id, {
        ...data,
        lastScrapedAt: new Date(),
      });
      const updated = await this.navigationRepository.findOne({
        where: { id: existing.id },
      });
      if (!updated) throw new Error('Failed to find updated navigation');
      return updated;
    }

    const navigation = this.navigationRepository.create({
      ...data,
      lastScrapedAt: new Date(),
    });
    return this.navigationRepository.save(navigation);
  }

  async upsertMany(items: Partial<Navigation>[]): Promise<Navigation[]> {
    const results: Navigation[] = [];
    for (const item of items) {
      const result = await this.upsert(item);
      results.push(result);
    }
    return results;
  }

  async needsRefresh(slug: string, ttlHours: number = 24): Promise<boolean> {
    const navigation = await this.navigationRepository.findOne({
      where: { slug },
    });

    if (!navigation || !navigation.lastScrapedAt) {
      return true;
    }

    const hoursSinceLastScrape =
      (Date.now() - navigation.lastScrapedAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastScrape > ttlHours;
  }
}
