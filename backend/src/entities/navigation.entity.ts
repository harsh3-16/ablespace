import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('navigation')
export class Navigation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Index()
  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  lastScrapedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Category, (category) => category.navigation)
  categories: Category[];
}
