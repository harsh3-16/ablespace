import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Navigation } from './entities/navigation.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { Review } from './entities/review.entity';

// Parse DATABASE_URL if provided
function getDbConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    };
  }

  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'product_explorer',
    ssl: false,
  };
}

const dbConfig = getDbConfig();

const dataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  entities: [Navigation, Category, Product, ProductDetail, Review],
  synchronize: true,
});

async function seed() {
  console.log('🌱 Starting database seed...');

  await dataSource.initialize();
  console.log('📦 Database connected');

  const navRepo = dataSource.getRepository(Navigation);
  const catRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const detailRepo = dataSource.getRepository(ProductDetail);
  const reviewRepo = dataSource.getRepository(Review);

  // Clear existing data using CASCADE
  await dataSource.query(
    'TRUNCATE TABLE review, product_detail, product, category, navigation CASCADE',
  );
  console.log('🗑️  Cleared existing data');

  // Create Navigation headings
  const navigations = await navRepo.save([
    {
      title: 'Fiction Books',
      slug: 'fiction-books',
      displayOrder: 0,
      sourceUrl: 'https://www.worldofbooks.com/en-gb/category/fiction',
    },
    {
      title: 'Non-Fiction Books',
      slug: 'non-fiction-books',
      displayOrder: 1,
      sourceUrl: 'https://www.worldofbooks.com/en-gb/category/non-fiction',
    },
    {
      title: "Children's Books",
      slug: 'childrens-books',
      displayOrder: 2,
      sourceUrl: 'https://www.worldofbooks.com/en-gb/category/childrens-books',
    },
  ]);
  console.log('📚 Created navigation headings');

  // Create Categories
  const categories = await catRepo.save([
    {
      title: 'Mystery & Thriller',
      slug: 'mystery-thriller',
      navigationId: navigations[0].id,
      productCount: 15000,
    },
    {
      title: 'Romance',
      slug: 'romance',
      navigationId: navigations[0].id,
      productCount: 12000,
    },
    {
      title: 'Science Fiction',
      slug: 'science-fiction',
      navigationId: navigations[0].id,
      productCount: 8000,
    },
    {
      title: 'Fantasy',
      slug: 'fantasy',
      navigationId: navigations[0].id,
      productCount: 10000,
    },
    {
      title: 'Literary Fiction',
      slug: 'literary-fiction',
      navigationId: navigations[0].id,
      productCount: 7500,
    },
    {
      title: 'Biography',
      slug: 'biography',
      navigationId: navigations[1].id,
      productCount: 9000,
    },
    {
      title: 'History',
      slug: 'history',
      navigationId: navigations[1].id,
      productCount: 11000,
    },
    {
      title: 'Self-Help',
      slug: 'self-help',
      navigationId: navigations[1].id,
      productCount: 6000,
    },
    {
      title: 'Science & Nature',
      slug: 'science-nature',
      navigationId: navigations[1].id,
      productCount: 5500,
    },
    {
      title: 'Picture Books',
      slug: 'picture-books',
      navigationId: navigations[2].id,
      productCount: 4000,
    },
    {
      title: 'Young Adult',
      slug: 'young-adult',
      navigationId: navigations[2].id,
      productCount: 5000,
    },
  ]);
  console.log('📂 Created categories');

  // Create Products with details
  const products = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      price: 8.99,
      isbn: '978-0743273565',
      category: categories[4],
    },
    {
      title: '1984',
      author: 'George Orwell',
      price: 7.99,
      isbn: '978-0451524935',
      category: categories[2],
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      price: 6.99,
      isbn: '978-0141439518',
      category: categories[1],
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      price: 9.99,
      isbn: '978-0061120084',
      category: categories[4],
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      price: 8.49,
      isbn: '978-0316769488',
      category: categories[4],
    },
    {
      title: 'Lord of the Flies',
      author: 'William Golding',
      price: 7.49,
      isbn: '978-0571191475',
      category: categories[4],
    },
    {
      title: 'Animal Farm',
      author: 'George Orwell',
      price: 5.99,
      isbn: '978-0451526342',
      category: categories[2],
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      price: 8.99,
      isbn: '978-0060850524',
      category: categories[2],
    },
    {
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      price: 10.99,
      isbn: '978-0307474278',
      category: categories[0],
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      price: 9.99,
      isbn: '978-0307588371',
      category: categories[0],
    },
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      price: 11.99,
      isbn: '978-0307454546',
      category: categories[0],
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      price: 12.99,
      isbn: '978-0441172719',
      category: categories[2],
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      price: 9.99,
      isbn: '978-0547928227',
      category: categories[3],
    },
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: 'J.K. Rowling',
      price: 10.99,
      isbn: '978-1408855652',
      category: categories[3],
    },
    {
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      price: 11.99,
      isbn: '978-0553593716',
      category: categories[3],
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      price: 14.99,
      isbn: '978-0062316110',
      category: categories[6],
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 12.99,
      isbn: '978-0735211292',
      category: categories[7],
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      price: 13.99,
      isbn: '978-0374533557',
      category: categories[7],
    },
    {
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      price: 15.99,
      isbn: '978-1451648539',
      category: categories[5],
    },
    {
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      price: 7.99,
      isbn: '978-0553296983',
      category: categories[5],
    },
  ];

  for (const p of products) {
    const product = await productRepo.save({
      sourceId: `wob-${p.isbn.replace(/-/g, '')}`,
      title: p.title,
      author: p.author,
      price: p.price,
      currency: 'GBP',
      originalPrice: p.price * 1.5,
      inStock: true,
      condition: 'Good',
      categoryId: p.category.id,
      sourceUrl: `https://www.worldofbooks.com/en-gb/search?keyword=${encodeURIComponent(p.title)}`,
    });

    await detailRepo.save({
      productId: product.id,
      description: `${p.title} by ${p.author}. A must-read classic that has captivated readers for generations.`,
      isbn: p.isbn,
      format: 'Paperback',
      pages: Math.floor(Math.random() * 300) + 150,
      publisher: 'Penguin Books',
      language: 'English',
      ratingsAvg: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviewsCount: Math.floor(Math.random() * 500) + 50,
    });

    // Add sample reviews
    await reviewRepo.save([
      {
        productId: product.id,
        author: 'John D.',
        rating: 5,
        text: 'Absolutely loved this book!',
        title: 'Amazing read',
      },
      {
        productId: product.id,
        author: 'Sarah M.',
        rating: 4,
        text: 'Great book, highly recommend.',
        title: 'Very good',
      },
    ]);
  }
  console.log('📖 Created products with details and reviews');

  await dataSource.destroy();
  console.log('✅ Seed completed successfully!');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
