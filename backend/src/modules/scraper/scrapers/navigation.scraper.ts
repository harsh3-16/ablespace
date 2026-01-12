import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Navigation } from '../../../entities';

interface ScrapedNavItem {
    title: string;
    href: string;
}

@Injectable()
export class NavigationScraperService {
    private readonly logger = new Logger(NavigationScraperService.name);
    private readonly baseUrl: string;

    constructor(
        @InjectRepository(Navigation)
        private readonly navigationRepository: Repository<Navigation>,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get('scraper.baseUrl') || 'https://www.worldofbooks.com';
    }

    async scrape(url: string): Promise<number> {
        this.logger.log(`Starting navigation scrape from ${url}`);
        let itemsScraped = 0;

        const scrapedItems: ScrapedNavItem[] = [];
        const baseUrl = this.baseUrl;

        // Configure Crawlee to not persist data
        Configuration.getGlobalConfig().set('persistStorage', false);

        const crawler = new PlaywrightCrawler({
            maxRequestsPerCrawl: 1,
            requestHandlerTimeoutSecs: 60,
            navigationTimeoutSecs: 30,

            requestHandler: async ({ page, request }) => {
                this.logger.log(`Loading navigation page: ${request.url}`);
                await page.waitForLoadState('networkidle');

                // Wait a bit for dynamic content
                await page.waitForTimeout(2000);

                // Extract main navigation items using World of Books specific selectors
                const navItems: ScrapedNavItem[] = await page.evaluate(() => {
                    const seen = new Set<string>();
                    const results: Array<{ title: string; href: string }> = [];

                    // World of Books specific selector for main nav
                    const links = document.querySelectorAll('a.header__menu-item, nav a[href*="/collections/"], header a[href*="/collections/"]');

                    for (const link of links) {
                        const href = link.getAttribute('href') || '';
                        const title = link.textContent?.trim() || '';

                        // Filter for collection/category links
                        if (
                            (href.includes('/collections/') || href.includes('/category/')) &&
                            title &&
                            title.length > 2 &&
                            !seen.has(href) &&
                            !href.includes('author-') // Skip author collections
                        ) {
                            seen.add(href);
                            results.push({ title, href });
                        }
                    }

                    return results;
                });

                this.logger.log(`Found ${navItems.length} navigation items`);
                scrapedItems.push(...navItems);
            },
        });

        try {
            // Use unique key to prevent Crawlee request deduplication
            const uniqueKey = `${url}-${Date.now()}`;
            await crawler.run([{ url, uniqueKey }]);

            // Group by main categories and save
            const mainCategories = ['fiction', 'non-fiction', 'children'];
            const navigations: Partial<Navigation>[] = [];

            for (const item of scrapedItems) {
                const slug = item.href.split('/collections/')[1]?.split('?')[0] || '';

                if (slug && mainCategories.some((cat) => slug.includes(cat))) {
                    navigations.push({
                        title: item.title,
                        slug,
                        sourceUrl: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
                        displayOrder: navigations.length,
                    });
                }
            }

            // Deduplicate and save
            const uniqueNavigations = this.deduplicateNavigations(navigations);

            for (const nav of uniqueNavigations) {
                const existing = await this.navigationRepository.findOne({ where: { slug: nav.slug } });

                if (existing) {
                    await this.navigationRepository.update(existing.id, {
                        ...nav,
                        lastScrapedAt: new Date(),
                    });
                } else {
                    await this.navigationRepository.save(
                        this.navigationRepository.create({
                            ...nav,
                            lastScrapedAt: new Date(),
                        }),
                    );
                }
                itemsScraped++;
            }

            this.logger.log(`Navigation scrape complete: ${itemsScraped} items`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Navigation scrape failed: ${errorMessage}`);
            throw error;
        }

        return itemsScraped;
    }

    private deduplicateNavigations(items: Partial<Navigation>[]): Partial<Navigation>[] {
        const seen = new Map<string, Partial<Navigation>>();

        for (const item of items) {
            if (item.slug && !seen.has(item.slug)) {
                seen.set(item.slug, item);
            }
        }

        return Array.from(seen.values());
    }
}
