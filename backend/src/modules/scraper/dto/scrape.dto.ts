import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScrapeTargetType } from '../../../entities';

export class TriggerScrapeDto {
  @ApiProperty({ description: 'URL to scrape' })
  @IsString()
  targetUrl: string;

  @ApiProperty({ enum: ScrapeTargetType })
  @IsEnum(ScrapeTargetType)
  targetType: ScrapeTargetType;

  @ApiPropertyOptional({ description: 'Force refresh even if cache is valid' })
  @IsOptional()
  forceRefresh?: boolean;
}

export class ScrapeResponseDto {
  jobId: string;
  status: string;
  message: string;
}
