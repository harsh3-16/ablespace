import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Category } from '../../../entities';

interface ScrapedCategoryItem {
  title: string;
  href: string;
  imageUrl: string | undefined;
}

@Injectable()
export class CategoryScraperService {
  private readonly logger = new Logger(CategoryScraperService.name);
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get('scraper.baseUrl') ||
      'https://www.worldofbooks.com';
  }

  async scrape(url: string, navigationId?: string): Promise<number> {
    this.logger.log(`Starting category scrape from ${url}`);
    let itemsScraped = 0;

    const scrapedItems: ScrapedCategoryItem[] = [];
    const baseUrl = this.baseUrl;

    Configuration.getGlobalConfig().set('persistStorage', false);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 60,
      navigationTimeoutSecs: 30,

      requestHandler: async ({ page, request }) => {
        this.logger.log(`Loading category page: ${request.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Wait for Algolia-powered product grid
        try {
          await page.waitForSelector('.ais-InfiniteHits-item, .grid__item', {
            timeout: 5000,
          });
          this.logger.log('Product grid loaded');
        } catch {
          this.logger.warn('Product grid selector not found');
        }

        // Extract category links and subcategories from the page
        const categoryItems: ScrapedCategoryItem[] = await page.evaluate(() => {
          const seen = new Set<string>();
          const results: Array<{
            title: string;
            href: string;
            imageUrl: string | undefined;
          }> = [];

          // World of Books uses refinement lists for subcategories
          const links = document.querySelectorAll(
            '.ais-RefinementList-item a, a[href*="/collections/"], .filter-group a',
          );

          for (const link of links) {
            const href = link.getAttribute('href') || '';
            const title = link.textContent?.trim() || '';
            const img = link.querySelector('img');
            const imageUrl = img?.getAttribute('src') || undefined;

            if (
              href &&
              (href.includes('/collections/') || href.includes('/category/')) &&
              title &&
              title.length > 2 &&
              !seen.has(href) &&
              !href.includes('author-')
            ) {
              seen.add(href);
              results.push({ title, href, imageUrl });
            }
          }

          return results;
        });

        this.logger.log(`Found ${categoryItems.length} category items`);
        scrapedItems.push(...categoryItems);
      },
    });

    try {
      // Use unique key to prevent Crawlee request deduplication
      const uniqueKey = `${url}-${Date.now()}`;
      await crawler.run([{ url, uniqueKey }]);

      // Process and save categories
      const categories: Partial<Category>[] = [];

      for (const item of scrapedItems) {
        const slug = item.href.split('/collections/')[1]?.split('?')[0] || '';

        if (slug) {
          categories.push({
            title: item.title,
            slug,
            sourceUrl: item.href.startsWith('http')
              ? item.href
              : `${baseUrl}${item.href}`,
            imageUrl: item.imageUrl,
            navigationId,
            displayOrder: categories.length,
          });
        }
      }

      // Deduplicate and save
      const uniqueCategories = this.deduplicateCategories(categories);

      for (const cat of uniqueCategories) {
        const existing = await this.categoryRepository.findOne({
          where: { slug: cat.slug },
        });

        if (existing) {
          await this.categoryRepository.update(existing.id, {
            ...cat,
            lastScrapedAt: new Date(),
          });
        } else {
          await this.categoryRepository.save(
            this.categoryRepository.create({
              ...cat,
              lastScrapedAt: new Date(),
            }),
          );
        }
        itemsScraped++;
      }

      this.logger.log(`Category scrape complete: ${itemsScraped} items`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Category scrape failed: ${errorMessage}`);
      throw error;
    }

    return itemsScraped;
  }

  private deduplicateCategories(
    items: Partial<Category>[],
  ): Partial<Category>[] {
    const seen = new Map<string, Partial<Category>>();

    for (const item of items) {
      if (item.slug && !seen.has(item.slug)) {
        seen.set(item.slug, item);
      }
    }

    return Array.from(seen.values());
  }
}
