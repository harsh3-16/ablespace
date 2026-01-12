import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ScrapeJob,
  Navigation,
  Category,
  Product,
  ProductDetail,
  Review,
} from '../../entities';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { NavigationScraperService } from './scrapers/navigation.scraper';
import { CategoryScraperService } from './scrapers/category.scraper';
import { ProductScraperService } from './scrapers/product.scraper';
import { NavigationModule } from '../navigation/navigation.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScrapeJob,
      Navigation,
      Category,
      Product,
      ProductDetail,
      Review,
    ]),
    forwardRef(() => NavigationModule),
    forwardRef(() => CategoriesModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    NavigationScraperService,
    CategoryScraperService,
    ProductScraperService,
  ],
  exports: [ScraperService],
})
export class ScraperModule {}
