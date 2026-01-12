import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryService } from './history.service';
import { ViewHistory } from '../../entities';

describe('HistoryService', () => {
  let service: HistoryService;
  let historyRepo: jest.Mocked<Repository<ViewHistory>>;

  const mockHistory: Partial<ViewHistory> = {
    id: 'history-1',
    sessionId: 'session-123',
    pathHistory: [
      { path: '/', title: 'Home', timestamp: '2024-01-01T00:00:00Z' },
    ],
    lastPath: '/',
  };

  beforeEach(async () => {
    const mockHistoryRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getRepositoryToken(ViewHistory),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    historyRepo = module.get(getRepositoryToken(ViewHistory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBySessionId', () => {
    it('should return history for existing session', async () => {
      historyRepo.findOne.mockResolvedValue(mockHistory as ViewHistory);

      const result = await service.getBySessionId('session-123');

      expect(historyRepo.findOne).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
      });
      expect(result).toEqual(mockHistory);
    });

    it('should return null for non-existent session', async () => {
      historyRepo.findOne.mockResolvedValue(null);

      const result = await service.getBySessionId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('addPathToHistory', () => {
    it('should add path to existing history', async () => {
      const existingHistory = {
        ...mockHistory,
        pathHistory: [
          { path: '/', title: 'Home', timestamp: '2024-01-01T00:00:00Z' },
        ],
      };
      historyRepo.findOne.mockResolvedValue(existingHistory as ViewHistory);
      historyRepo.save.mockResolvedValue({
        ...existingHistory,
        pathHistory: [
          { path: '/', title: 'Home', timestamp: '2024-01-01T00:00:00Z' },
          {
            path: '/products',
            title: 'Products',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            timestamp: expect.any(String),
          },
        ],
        lastPath: '/products',
      } as ViewHistory);

      await service.addPathToHistory('session-123', '/products', 'Products');

      expect(historyRepo.save).toHaveBeenCalled();
      // Verify via spy since we aren't capturing the return result anymore
      expect(historyRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          lastPath: '/products',
        }),
      );
    });

    it('should create new history for new session', async () => {
      historyRepo.findOne.mockResolvedValue(null);
      historyRepo.create.mockReturnValue({
        sessionId: 'new-session',
        pathHistory: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { path: '/', title: 'Home', timestamp: expect.any(String) },
        ],
        lastPath: '/',
      } as ViewHistory);
      historyRepo.save.mockResolvedValue({
        id: 'new-id',
        sessionId: 'new-session',
        pathHistory: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { path: '/', title: 'Home', timestamp: expect.any(String) },
        ],
        lastPath: '/',
      } as ViewHistory);

      await service.addPathToHistory('new-session', '/', 'Home');

      expect(historyRepo.create).toHaveBeenCalled();
      expect(historyRepo.save).toHaveBeenCalled();
    });

    it('should limit history to 50 entries', async () => {
      const fullHistory = {
        ...mockHistory,
        pathHistory: Array(50).fill({
          path: '/test',
          title: 'Test',
          timestamp: '2024-01-01',
        }),
      };
      historyRepo.findOne.mockResolvedValue(fullHistory as ViewHistory);
      historyRepo.save.mockImplementation((h) =>
        Promise.resolve(h as ViewHistory),
      );

      await service.addPathToHistory('session-123', '/new', 'New');

      const saveCall = historyRepo.save.mock.calls[0][0];
      expect(saveCall.pathHistory?.length || 0).toBeLessThanOrEqual(50);
    });
  });

  describe('clearHistory', () => {
    it('should delete history by session ID', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      historyRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await service.clearHistory('session-123');

      expect(historyRepo.delete).toHaveBeenCalledWith({
        sessionId: 'session-123',
      });
    });
  });
});
