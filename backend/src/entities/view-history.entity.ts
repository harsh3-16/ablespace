import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('view_history')
export class ViewHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Index()
  @Column()
  sessionId: string;

  // JSON array of visited paths with timestamps
  @Column({ type: 'jsonb', default: [] })
  pathHistory: Array<{
    path: string;
    title: string;
    timestamp: string;
  }>;

  @Column({ nullable: true })
  lastPath: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
