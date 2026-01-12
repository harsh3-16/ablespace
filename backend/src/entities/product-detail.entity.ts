import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_detail')
export class ProductDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription: string;

  // JSON field for flexible specs (ISBN, publisher, pages, etc.)
  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, any>;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingsAvg: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ nullable: true })
  publisher: string;

  @Column({ nullable: true })
  publicationDate: string;

  @Column({ nullable: true })
  isbn: string;

  @Column({ nullable: true })
  format: string;

  @Column({ nullable: true })
  pages: number;

  @Column({ nullable: true })
  language: string;

  // Related/recommended product IDs (JSON array)
  @Column({ type: 'jsonb', nullable: true, default: [] })
  recommendedProductIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Product relationship
  @OneToOne(() => Product, (product) => product.detail)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
