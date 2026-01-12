import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { ViewHistory } from '../../entities';

class AddHistoryDto {
    sessionId: string;
    path: string;
    title: string;
    userId?: string;
}

@ApiTags('history')
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get(':sessionId')
    @ApiOperation({ summary: 'Get browsing history by session ID' })
    @ApiResponse({ status: 200, description: 'Returns browsing history' })
    async getHistory(@Param('sessionId') sessionId: string): Promise<ViewHistory | null> {
        return this.historyService.getBySessionId(sessionId);
    }

    @Post()
    @ApiOperation({ summary: 'Add path to browsing history' })
    @ApiResponse({ status: 201, description: 'Path added to history' })
    async addToHistory(@Body() dto: AddHistoryDto): Promise<ViewHistory> {
        return this.historyService.addPathToHistory(
            dto.sessionId,
            dto.path,
            dto.title,
            dto.userId,
        );
    }

    @Delete(':sessionId')
    @ApiOperation({ summary: 'Clear browsing history' })
    @ApiResponse({ status: 200, description: 'History cleared' })
    async clearHistory(@Param('sessionId') sessionId: string): Promise<void> {
        return this.historyService.clearHistory(sessionId);
    }
}
