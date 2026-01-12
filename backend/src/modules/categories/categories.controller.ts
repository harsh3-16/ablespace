import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from '../../entities';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'navigationId', required: false })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  async findAll(
    @Query('navigationId') navigationId?: string,
  ): Promise<Category[]> {
    if (navigationId) {
      return this.categoriesService.findByNavigationId(navigationId);
    }
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug with subcategories' })
  @ApiParam({ name: 'slug', example: 'fantasy-fiction-books' })
  @ApiResponse({
    status: 200,
    description: 'Returns category with subcategories',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  @Get(':id/subcategories')
  @ApiOperation({ summary: 'Get subcategories of a category' })
  @ApiParam({ name: 'id', description: 'Parent category ID' })
  @ApiResponse({ status: 200, description: 'Returns subcategories' })
  async findSubcategories(@Param('id') id: string): Promise<Category[]> {
    return this.categoriesService.findSubcategories(id);
  }
}
