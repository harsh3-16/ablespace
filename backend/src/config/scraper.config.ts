import { registerAs } from '@nestjs/config';

export default registerAs('scraper', () => ({
  delayMs: parseInt(process.env.SCRAPE_DELAY_MS || '2000', 10),
  cacheTtlHours: parseInt(process.env.CACHE_TTL_HOURS || '24', 10),
  maxConcurrency: parseInt(process.env.SCRAPE_MAX_CONCURRENCY || '1', 10),
  retryAttempts: parseInt(process.env.SCRAPE_RETRY_ATTEMPTS || '3', 10),
  baseUrl: 'https://www.worldofbooks.com',
}));
