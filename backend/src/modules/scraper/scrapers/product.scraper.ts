import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Product, ProductDetail, Review } from '../../../entities';

interface ScrapedProduct {
  title: string;
  author: string | undefined;
  price: string | undefined;
  imageUrl: string | undefined;
  href: string;
  sourceId: string;
}

interface ScrapedDetail {
  title: string;
  description: string;
  price: string | undefined;
  author: string | undefined;
  imageUrl: string | undefined;
  specs: Record<string, any>;
}

@Injectable()
export class ProductScraperService {
  private readonly logger = new Logger(ProductScraperService.name);
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get('scraper.baseUrl') ||
      'https://www.worldofbooks.com';
  }

  async scrapeProductList(url: string, categoryId?: string): Promise<number> {
    this.logger.log(`Starting product list scrape from ${url}`);
    let itemsScraped = 0;

    const products: Partial<Product>[] = [];
    const baseUrl = this.baseUrl;

    Configuration.getGlobalConfig().set('persistStorage', false);

    const logger = this.logger;

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 120,
      navigationTimeoutSecs: 60,
      useSessionPool: false,

      failedRequestHandler: ({ request }, error: Error) => {
        logger.error(`Request failed: ${request.url} - ${error.message}`);
      },

      requestHandler: async ({ page, request }) => {
        this.logger.log(`Loading product list: ${request.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Wait for Algolia product grid
        try {
          await page.waitForSelector(
            '.ais-InfiniteHits-item, .grid__item, .product-card',
            { timeout: 5000 },
          );
          this.logger.log('Product grid found');
        } catch {
          this.logger.warn('Product grid not found');
        }

        // Extract product cards using World of Books specific selectors
        const productItems = await page.evaluate<ScrapedProduct[]>(() => {
          const results: ScrapedProduct[] = [];

          // World of Books uses Algolia InfiniteHits for product grid
          const elements = document.querySelectorAll(
            '.ais-InfiniteHits-item, .grid__item, .product-card-wrapper',
          );

          for (const el of elements) {
            // Find the product link
            const link = el.querySelector(
              'a[href*="/products/"]',
            ) as HTMLAnchorElement;
            const href = link?.getAttribute('href') || '';

            if (!href.includes('/products/')) continue;

            // Title - World of Books specific
            const titleEl = el.querySelector(
              '.product-card.truncate-title, .product-card, h2, h3',
            );
            const title = titleEl?.textContent?.trim() || '';

            // Author - usually text after title or in specific element
            const productContent = el.querySelector('.product-content');
            let author: string | undefined;
            if (productContent) {
              const allText = productContent.textContent || '';
              const byMatch = allText.match(/by\s+([^£\n]+)/i);
              if (byMatch) author = byMatch[1].trim();
            }

            // Price
            const priceEl = el.querySelector('.price, [class*="price"]');
            const priceText = priceEl?.textContent?.trim() || '';
            const priceMatch = priceText.match(/£([\d.]+)/);
            const price = priceMatch ? `£${priceMatch[1]}` : undefined;

            // Image
            const imgEl = el.querySelector('img');
            const imageUrl =
              imgEl?.getAttribute('src') ||
              imgEl?.getAttribute('data-src') ||
              undefined;

            // Extract source ID from URL
            const sourceId = href.split('/products/')[1]?.split('?')[0] || '';

            if (title && sourceId) {
              results.push({ title, author, price, imageUrl, href, sourceId });
            }
          }

          return results;
        });

        this.logger.log(`Found ${productItems.length} products`);

        for (const item of productItems) {
          const priceNum = item.price
            ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
            : undefined;

          products.push({
            title: item.title,
            author: item.author,
            price: priceNum,
            currency: item.price?.includes('£') ? 'GBP' : 'USD',
            imageUrl: item.imageUrl,
            sourceUrl: item.href.startsWith('http')
              ? item.href
              : `${baseUrl}${item.href}`,
            sourceId: item.sourceId,
            categoryId,
          });
        }
      },
    });

    try {
      this.logger.log(`Queueing URL for crawl: ${url}`);
      // Use unique key to prevent Crawlee request deduplication
      const uniqueKey = `${url}-${Date.now()}`;
      await crawler.run([{ url, uniqueKey }]);

      for (const prod of products) {
        const existing = await this.productRepository.findOne({
          where: { sourceId: prod.sourceId },
        });

        if (existing) {
          await this.productRepository.update(existing.id, {
            ...prod,
            lastScrapedAt: new Date(),
          });
        } else {
          await this.productRepository.save(
            this.productRepository.create({
              ...prod,
              lastScrapedAt: new Date(),
            }),
          );
        }
        itemsScraped++;
      }

      this.logger.log(`Product list scrape complete: ${itemsScraped} items`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Product list scrape failed: ${errorMessage}`);
      throw error;
    }

    return itemsScraped;
  }

  async scrapeProductDetail(url: string): Promise<number> {
    this.logger.log(`Starting product detail scrape from ${url}`);
    let itemsScraped = 0;

    let scrapedDetails: ScrapedDetail | null = null;

    Configuration.getGlobalConfig().set('persistStorage', false);

    const logger = this.logger;

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 120,
      navigationTimeoutSecs: 60,
      useSessionPool: false,

      failedRequestHandler: ({ request }, error: Error) => {
        logger.error(`Request failed: ${request.url} - ${error.message}`);
      },

      requestHandler: async ({ page, request }) => {
        this.logger.log(`Loading page: ${request.url}`);

        // Wait for page to fully load
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        // Wait for price to load (dynamic content)
        try {
          await page.waitForSelector('.price-item--regular', { timeout: 5000 });
          this.logger.log('Price element found');
        } catch {
          this.logger.warn('Price selector not found, continuing...');
        }

        // Click Additional Information accordion to reveal specs
        try {
          const additionalInfoBtn = await page.$(
            'button.accordion-head:has-text("Additional")',
          );
          if (additionalInfoBtn) {
            await additionalInfoBtn.click();
            await page.waitForTimeout(500);
            this.logger.log('Clicked Additional Information accordion');
          }
        } catch {
          this.logger.warn('Could not click Additional Information accordion');
        }

        // Log page title for debugging
        const pageTitle = await page.title();
        this.logger.log(`Page title: ${pageTitle}`);

        // Extract product details with World of Books specific selectors
        /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
        scrapedDetails = await page.evaluate((): ScrapedDetail => {
          // First try to get data from JSON-LD (most reliable)
          const jsonLdScripts = document.querySelectorAll(
            'script[type="application/ld+json"]',
          );

          let jsonLdData: any = null;

          jsonLdScripts.forEach((script) => {
            try {
              const data = JSON.parse(script.textContent || '');
              if (data['@type'] === 'Book' || data['@type'] === 'Product') {
                jsonLdData = data;
              }
            } catch {
              // Ignore scripts that don't contain valid JSON or aren't book data
            }
          });

          // Title - from h1 or JSON-LD
          const title =
            jsonLdData?.name ||
            document.querySelector('h1')?.textContent?.trim() ||
            '';

          // Author - from JSON-LD or author link
          const author =
            jsonLdData?.author?.name ||
            document
              .querySelector('a[href*="/collections/author-"]')
              ?.textContent?.trim() ||
            '';

          // Description - from JSON-LD or Summary accordion
          let description = jsonLdData?.description || '';
          if (!description) {
            const summaryBtn = Array.from(
              document.querySelectorAll('button.accordion-head'),
            ).find((b) => b.textContent?.toLowerCase().includes('summary'));
            if (summaryBtn?.nextElementSibling) {
              description =
                summaryBtn.nextElementSibling.textContent?.trim() || '';
            }
          }

          // Price - from price element
          const priceEl = document.querySelector(
            '.price-item.price-item--regular',
          );
          const price = priceEl?.textContent?.trim();

          // Image - from JSON-LD or product image
          const imageUrl =
            jsonLdData?.image ||
            document
              .querySelector('.product__media img')
              ?.getAttribute('src') ||
            undefined;

          // Specs from Additional Information section
          const specs: Record<string, string> = {};

          // ISBN
          const isbn =
            jsonLdData?.isbn ||
            document.querySelector('#info-isbn13')?.textContent?.trim();
          if (isbn) specs['isbn'] = isbn;

          // Format/Binding
          const format =
            jsonLdData?.bookFormat ||
            document.querySelector('#info-binding-type')?.textContent?.trim();
          if (format) specs['format'] = format;

          // Publisher
          const publisher =
            jsonLdData?.publisher?.name ||
            document.querySelector('#info-publisher')?.textContent?.trim();
          if (publisher) specs['publisher'] = publisher;

          // Pages
          const pages = document
            .querySelector('#info-pages')
            ?.textContent?.trim();
          if (pages) specs['pages'] = pages;

          // Publication date
          const pubDate =
            jsonLdData?.datePublished ||
            document
              .querySelector('#info-publication-date')
              ?.textContent?.trim();
          if (pubDate) specs['publicationDate'] = pubDate;

          return { title, description, price, author, imageUrl, specs };
        });

        this.logger.log(
          `Scraped: "${scrapedDetails?.title}" by ${scrapedDetails?.author}`,
        );
        this.logger.log(
          `  Price: ${scrapedDetails?.price}, Image: ${scrapedDetails?.imageUrl ? 'Yes' : 'No'}`,
        );
        this.logger.log(`  Specs: ${JSON.stringify(scrapedDetails?.specs)}`);
      },
    });

    try {
      // Use unique key to prevent Crawlee request deduplication
      const uniqueKey = `${url}-${Date.now()}`;
      await crawler.run([{ url, uniqueKey }]);

      if (!scrapedDetails) {
        this.logger.warn('No details scraped');
        return 0;
      }

      // Assign to const for TypeScript narrowing
      const details: ScrapedDetail = scrapedDetails;

      // Get source ID from URL
      const sourceId = url.split('/products/')[1]?.split('?')[0] || '';

      if (!sourceId) {
        this.logger.warn('Could not extract source ID from URL');
        return 0;
      }

      // Find or create product
      let product = await this.productRepository.findOne({
        where: { sourceId },
      });

      const priceNum = details.price
        ? parseFloat(details.price.replace(/[^0-9.]/g, ''))
        : undefined;

      if (!product) {
        product = await this.productRepository.save(
          this.productRepository.create({
            sourceId,
            title: details.title,
            author: details.author,
            price: priceNum,
            currency: details.price?.includes('£') ? 'GBP' : 'USD',
            imageUrl: details.imageUrl,
            sourceUrl: url,
            lastScrapedAt: new Date(),
          }),
        );
        this.logger.log(`Created new product: ${product.id}`);
      } else {
        // Update existing product with new data
        await this.productRepository.update(product.id, {
          title: details.title,
          author: details.author,
          price: priceNum,
          currency: details.price?.includes('£') ? 'GBP' : 'USD',
          imageUrl: details.imageUrl,
          lastScrapedAt: new Date(),
        });
        this.logger.log(`Updated existing product: ${product.id}`);
      }

      // Update or create product detail
      const existingDetail = await this.productDetailRepository.findOne({
        where: { product: { id: product.id } },
      });

      const detailData = {
        description: details.description,
        specs: details.specs,

        isbn: details.specs?.isbn as string | undefined,
        format: details.specs?.format as string | undefined,
        publisher: details.specs?.publisher as string | undefined,
        pages: details.specs?.pages
          ? parseInt(String(details.specs.pages), 10)
          : undefined,
        publicationDate: details.specs?.publicationDate as string | undefined,
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      };

      this.logger.log(`Detail data to save: ${JSON.stringify(detailData)}`);

      if (existingDetail) {
        await this.productDetailRepository.update(
          existingDetail.id,
          detailData,
        );
        this.logger.log(`Updated existing detail: ${existingDetail.id}`);
      } else {
        const newDetail = await this.productDetailRepository.save(
          this.productDetailRepository.create({
            product: product,
            ...detailData,
          }),
        );
        this.logger.log(`Created new detail: ${newDetail.id}`);
      }

      itemsScraped = 1;
      this.logger.log(`Product detail scrape complete`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Product detail scrape failed: ${errorMessage}`);
      throw error;
    }

    return itemsScraped;
  }
}
