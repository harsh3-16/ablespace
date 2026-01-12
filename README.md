# 📚 Product Data Explorer

A full-stack product exploration platform that lets users navigate from high-level categories → subcategories → products → product details, powered by live, on-demand scraping from World of Books.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## 🚀 Live Demo

- **Frontend**: [https://product-explorer.vercel.app](https://product-explorer.vercel.app)
- **Backend API**: [https://product-explorer-api.railway.app/api](https://product-explorer-api.railway.app/api)
- **API Documentation**: [https://product-explorer-api.railway.app/api/docs](https://product-explorer-api.railway.app/api/docs)

## 📋 Features

### Frontend

- ✅ Landing page with navigation headings
- ✅ Category drilldown pages
- ✅ Product grid with pagination & filters
- ✅ Product detail page (reviews, ratings, recommendations)
- ✅ Responsive design (mobile & desktop)
- ✅ Skeleton loading states
- ✅ SWR for data fetching & caching

### Backend

- ✅ RESTful API with NestJS
- ✅ PostgreSQL database with TypeORM
- ✅ Web scraping with Crawlee + Playwright
- ✅ On-demand scraping with job queuing
- ✅ Rate limiting & caching
- ✅ Swagger/OpenAPI documentation

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js 14    │────▶│    NestJS API   │────▶│   PostgreSQL    │
│   (Frontend)    │     │    (Backend)    │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │ Crawlee/Playwright│
                        │   (Scraping)    │
                        │                 │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  World of Books │
                        │   (Data Source) │
                        └─────────────────┘
```

## 🛠️ Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, SWR |
| Backend  | NestJS, TypeScript, TypeORM, Swagger                |
| Database | PostgreSQL                                          |
| Scraping | Crawlee, Playwright                                 |
| DevOps   | Docker, GitHub Actions                              |

## 📁 Project Structure

```
product-data-explorer/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # API client & utilities
│   │   └── types/            # TypeScript types
│   └── ...
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── entities/         # Database entities
│   │   └── modules/          # Feature modules
│   │       ├── navigation/
│   │       ├── categories/
│   │       ├── products/
│   │       ├── scraper/
│   │       └── history/
│   └── ...
├── docker-compose.yml        # Local development setup
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm or yarn

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/product-data-explorer.git
cd product-data-explorer

# Start all services (frontend, backend, database)
docker-compose up -d

# Seed the database with sample data
docker-compose exec backend npm run seed
```

Access:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

### Option 2: Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
createdb product_explorer

# Or use Docker for PostgreSQL only
docker run -d --name postgres \
  -e POSTGRES_DB=product_explorer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials

# Run database migrations (TypeORM will sync on first run)
npm run start:dev

# In a new terminal, seed sample data
npm run seed
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=product_explorer

# Scraper
SCRAPE_DELAY_MS=2000
CACHE_TTL_HOURS=24
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📚 API Endpoints

| Method | Endpoint                            | Description                           |
| ------ | ----------------------------------- | ------------------------------------- |
| GET    | `/api/navigation`                   | List all navigation headings          |
| GET    | `/api/navigation/:slug`             | Get navigation with categories        |
| GET    | `/api/categories`                   | List all categories                   |
| GET    | `/api/categories/:slug`             | Get category with products            |
| GET    | `/api/products`                     | List products (paginated, filterable) |
| GET    | `/api/products/:id`                 | Get product details with reviews      |
| GET    | `/api/products/:id/recommendations` | Get related products                  |
| POST   | `/api/scraper/trigger`              | Trigger on-demand scrape              |
| GET    | `/api/scraper/jobs`                 | List recent scrape jobs               |
| POST   | `/api/history`                      | Save browsing history                 |
| GET    | `/api/history/:sessionId`           | Get user's browsing history           |

### Query Parameters for `/api/products`

| Parameter  | Type    | Description                            |
| ---------- | ------- | -------------------------------------- |
| page       | number  | Page number (default: 1)               |
| limit      | number  | Items per page (default: 20, max: 100) |
| categoryId | string  | Filter by category                     |
| search     | string  | Search by title/author                 |
| minPrice   | number  | Minimum price filter                   |
| maxPrice   | number  | Maximum price filter                   |
| sortBy     | string  | Sort field (title, price, createdAt)   |
| sortOrder  | string  | ASC or DESC                            |
| inStock    | boolean | Filter in-stock items only             |

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 📝 Design Decisions

### Why PostgreSQL?

- Relational data with complex relationships (categories → products → reviews)
- JSONB support for flexible specs storage
- Strong consistency for inventory data
- Excellent TypeORM integration

### Why Crawlee + Playwright?

- Handles JavaScript-rendered pages
- Built-in request queue and rate limiting
- Automatic retries with exponential backoff
- Human-like browser behavior

### Caching Strategy

- 24-hour TTL on scraped data
- On-demand refresh via API
- Deduplication using source IDs

## ⚠️ Ethical Scraping

This project implements responsible scraping practices:

- ✅ Respects robots.txt
- ✅ 2-second delay between requests
- ✅ Caches results to minimize requests
- ✅ Exponential backoff on errors
- ✅ User-agent identification

## 👤 Author

**Harsh Arora**

## 📄 License

This project is for educational/demonstration purposes.
