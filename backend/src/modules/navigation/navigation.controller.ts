import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { Navigation } from '../../entities';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation headings' })
  @ApiResponse({
    status: 200,
    description: 'Returns all navigation headings (Fiction, Non-Fiction, etc.)',
  })
  async findAll(): Promise<Navigation[]> {
    return this.navigationService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get navigation by slug with categories' })
  @ApiParam({ name: 'slug', example: 'fiction-books' })
  @ApiResponse({
    status: 200,
    description: 'Returns navigation with its categories',
  })
  @ApiResponse({ status: 404, description: 'Navigation not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Navigation> {
    const navigation = await this.navigationService.findBySlug(slug);
    if (!navigation) {
      throw new NotFoundException(`Navigation with slug "${slug}" not found`);
    }
    return navigation;
  }
}
