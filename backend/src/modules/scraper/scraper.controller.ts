import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { TriggerScrapeDto } from './dto/scrape.dto';
import { ScrapeJob } from '../../entities';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger an on-demand scrape' })
  @ApiResponse({ status: 201, description: 'Scrape job created' })
  async triggerScrape(@Body() dto: TriggerScrapeDto): Promise<ScrapeJob> {
    return this.scraperService.triggerScrape(
      dto.targetUrl,
      dto.targetType,
      dto.forceRefresh,
    );
  }

  @Post('scrape-all')
  @ApiOperation({ summary: 'Trigger full site scrape' })
  @ApiResponse({ status: 201, description: 'Full scrape job started' })
  async scrapeAll(): Promise<ScrapeJob> {
    return this.scraperService.scrapeAll();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get recent scrape jobs' })
  @ApiResponse({ status: 200, description: 'Returns recent scrape jobs' })
  async getRecentJobs(@Query('limit') limit?: number): Promise<ScrapeJob[]> {
    return this.scraperService.getRecentJobs(limit);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get scrape job status' })
  @ApiResponse({ status: 200, description: 'Returns job status' })
  async getJobStatus(@Param('id') id: string): Promise<ScrapeJob | null> {
    return this.scraperService.getJobStatus(id);
  }
}
