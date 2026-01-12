import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapeJob, ScrapeJobStatus, ScrapeTargetType } from '../../entities';
import { NavigationScraperService } from './scrapers/navigation.scraper';
import { CategoryScraperService } from './scrapers/category.scraper';
import { ProductScraperService } from './scrapers/product.scraper';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    @InjectRepository(ScrapeJob)
    private readonly scrapeJobRepository: Repository<ScrapeJob>,
    private readonly configService: ConfigService,
    private readonly navigationScraper: NavigationScraperService,
    private readonly categoryScraper: CategoryScraperService,
    private readonly productScraper: ProductScraperService,
  ) {}

  async triggerScrape(
    targetUrl: string,
    targetType: ScrapeTargetType,
    forceRefresh: boolean = false,
  ): Promise<ScrapeJob> {
    // Check for existing pending/running job
    const existingJob = await this.scrapeJobRepository.findOne({
      where: {
        targetUrl,
        status: ScrapeJobStatus.RUNNING,
      },
    });

    if (existingJob) {
      this.logger.log(`Job already running for ${targetUrl}`);
      return existingJob;
    }

    // Create new job
    const job = this.scrapeJobRepository.create({
      targetUrl,
      targetType,
      status: ScrapeJobStatus.PENDING,
    });
    await this.scrapeJobRepository.save(job);

    // Execute scrape asynchronously
    this.executeScrape(job, forceRefresh).catch((error) => {
      this.logger.error(`Scrape failed for ${targetUrl}: ${error.message}`);
    });

    return job;
  }

  private async executeScrape(
    job: ScrapeJob,
    forceRefresh: boolean,
  ): Promise<void> {
    try {
      // Update job status to running
      job.status = ScrapeJobStatus.RUNNING;
      job.startedAt = new Date();
      await this.scrapeJobRepository.save(job);

      let itemsScraped = 0;

      switch (job.targetType) {
        case ScrapeTargetType.NAVIGATION:
          itemsScraped = await this.navigationScraper.scrape(job.targetUrl);
          break;
        case ScrapeTargetType.CATEGORY:
          itemsScraped = await this.categoryScraper.scrape(job.targetUrl);
          break;
        case ScrapeTargetType.PRODUCT_LIST:
          itemsScraped = await this.productScraper.scrapeProductList(
            job.targetUrl,
          );
          break;
        case ScrapeTargetType.PRODUCT_DETAIL:
          itemsScraped = await this.productScraper.scrapeProductDetail(
            job.targetUrl,
          );
          break;
      }

      // Update job as completed
      job.status = ScrapeJobStatus.COMPLETED;
      job.finishedAt = new Date();
      job.itemsScraped = itemsScraped;
      await this.scrapeJobRepository.save(job);

      this.logger.log(
        `Scrape completed: ${itemsScraped} items from ${job.targetUrl}`,
      );
    } catch (error) {
      // Update job as failed
      job.status = ScrapeJobStatus.FAILED;
      job.finishedAt = new Date();
      job.errorLog = error.message;
      await this.scrapeJobRepository.save(job);

      this.logger.error(`Scrape failed: ${error.message}`);
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<ScrapeJob | null> {
    return this.scrapeJobRepository.findOne({ where: { id: jobId } });
  }

  async getRecentJobs(limit: number = 20): Promise<ScrapeJob[]> {
    return this.scrapeJobRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async scrapeAll(): Promise<ScrapeJob> {
    // Trigger full site scrape starting with navigation
    return this.triggerScrape(
      'https://www.worldofbooks.com',
      ScrapeTargetType.NAVIGATION,
      true,
    );
  }
}
