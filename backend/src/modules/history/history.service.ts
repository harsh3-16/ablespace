import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewHistory } from '../../entities';

interface PathEntry {
  path: string;
  title: string;
  timestamp: string;
}

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(ViewHistory)
    private readonly historyRepository: Repository<ViewHistory>,
  ) {}

  async getBySessionId(sessionId: string): Promise<ViewHistory | null> {
    return this.historyRepository.findOne({ where: { sessionId } });
  }

  async addPathToHistory(
    sessionId: string,
    path: string,
    title: string,
    userId?: string,
  ): Promise<ViewHistory> {
    let history = await this.historyRepository.findOne({
      where: { sessionId },
    });

    const newEntry: PathEntry = {
      path,
      title,
      timestamp: new Date().toISOString(),
    };

    if (history) {
      // Add to existing history
      const pathHistory = history.pathHistory as PathEntry[];
      pathHistory.push(newEntry);

      // Keep only last 50 entries
      if (pathHistory.length > 50) {
        pathHistory.shift();
      }

      history.pathHistory = pathHistory;
      history.lastPath = path;
      return this.historyRepository.save(history);
    }

    // Create new history
    history = this.historyRepository.create({
      sessionId,
      userId,
      pathHistory: [newEntry],
      lastPath: path,
    });

    return this.historyRepository.save(history);
  }

  async clearHistory(sessionId: string): Promise<void> {
    await this.historyRepository.delete({ sessionId });
  }
}
