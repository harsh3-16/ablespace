import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductDetail } from './product-detail.entity';
import { Review } from './review.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  sourceId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ nullable: true, length: 255 })
  author: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Index()
  @Column({ unique: true })
  sourceUrl: string;

  @Column({ nullable: true, length: 50 })
  condition: string;

  @Column({ default: true })
  inStock: boolean;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  lastScrapedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Category relationship
  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  // Product detail relationship
  @OneToOne(() => ProductDetail, (detail) => detail.product, { cascade: true })
  detail: ProductDetail;

  // Reviews relationship
  @OneToMany(() => Review, (review) => review.product, { cascade: true })
  reviews: Review[];
}
