// API types matching backend entities

export interface Navigation {
    id: string;
    title: string;
    slug: string;
    sourceUrl?: string;
    imageUrl?: string;
    displayOrder: number;
    lastScrapedAt?: string;
    categories?: Category[];
}

export interface Category {
    id: string;
    title: string;
    slug: string;
    sourceUrl?: string;
    imageUrl?: string;
    productCount: number;
    displayOrder: number;
    parentId?: string;
    navigationId?: string;
    lastScrapedAt?: string;
    children?: Category[];
    products?: Product[];
}

export interface Product {
    id: string;
    sourceId: string;
    title: string;
    author?: string;
    price?: number;
    currency: string;
    originalPrice?: number;
    imageUrl?: string;
    sourceUrl: string;
    condition?: string;
    inStock: boolean;
    categoryId?: string;
    lastScrapedAt?: string;
    detail?: ProductDetail;
    reviews?: Review[];
}

export interface ProductDetail {
    id: string;
    description?: string;
    longDescription?: string;
    specs?: Record<string, any>;
    ratingsAvg?: number;
    reviewsCount: number;
    publisher?: string;
    publicationDate?: string;
    isbn?: string;
    format?: string;
    pages?: number;
    language?: string;
    recommendedProductIds?: string[];
}

export interface Review {
    id: string;
    author?: string;
    rating?: number;
    text?: string;
    title?: string;
    sourceReviewDate?: string;
    createdAt: string;
}

export interface ScrapeJob {
    id: string;
    targetUrl: string;
    targetType: 'navigation' | 'category' | 'product_list' | 'product_detail';
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: string;
    finishedAt?: string;
    errorLog?: string;
    error?: string; // Alias for errorLog
    itemsScraped: number;
    createdAt: string;
    updatedAt?: string;
}

export interface ViewHistory {
    id: string;
    sessionId: string;
    userId?: string;
    pathHistory: Array<{
        path: string;
        title: string;
        timestamp: string;
    }>;
    lastPath?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'title' | 'price' | 'createdAt' | 'ratingsAvg';
    sortOrder?: 'ASC' | 'DESC';
    inStock?: boolean;
}
