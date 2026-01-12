import axios from 'axios';
import useSWR, { SWRConfiguration } from 'swr';
import type {
    Navigation,
    Category,
    Product,
    PaginatedResponse,
    ProductQuery,
    ScrapeJob
} from '@/types';

// API base URL - reads from environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Axios instance
const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

// Generic fetcher for SWR
const fetcher = async <T>(url: string): Promise<T> => {
    const response = await api.get<T>(url);
    return response.data;
};

// Default SWR options
const defaultOptions: SWRConfiguration = {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
};

// ============ Navigation Hooks ============

export function useNavigations() {
    return useSWR<Navigation[]>('/navigation', fetcher, defaultOptions);
}

export function useNavigation(slug: string) {
    return useSWR<Navigation>(
        slug ? `/navigation/${slug}` : null,
        fetcher,
        defaultOptions
    );
}

// ============ Categories Hooks ============

export function useCategories(navigationId?: string) {
    const url = navigationId
        ? `/categories?navigationId=${navigationId}`
        : '/categories';
    return useSWR<Category[]>(url, fetcher, defaultOptions);
}

export function useCategory(slug: string) {
    return useSWR<Category>(
        slug ? `/categories/${slug}` : null,
        fetcher,
        defaultOptions
    );
}

// ============ Products Hooks ============

export function useProducts(query: ProductQuery = {}) {
    const params = new URLSearchParams();

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.categoryId) params.set('categoryId', query.categoryId);
    if (query.search) params.set('search', query.search);
    if (query.minPrice) params.set('minPrice', String(query.minPrice));
    if (query.maxPrice) params.set('maxPrice', String(query.maxPrice));
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);
    if (query.inStock !== undefined) params.set('inStock', String(query.inStock));

    const queryString = params.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;

    return useSWR<PaginatedResponse<Product>>(url, fetcher, defaultOptions);
}

export function useProduct(id: string) {
    return useSWR<Product>(
        id ? `/products/${id}` : null,
        fetcher,
        defaultOptions
    );
}

export function useRecommendedProducts(productId: string) {
    return useSWR<Product[]>(
        productId ? `/products/${productId}/recommendations` : null,
        fetcher,
        defaultOptions
    );
}

// ============ Scraper Functions ============

export async function triggerScrape(
    targetUrl: string,
    targetType: ScrapeJob['targetType'],
    forceRefresh = false
): Promise<ScrapeJob> {
    const response = await api.post<ScrapeJob>('/scraper/trigger', {
        targetUrl,
        targetType,
        forceRefresh,
    });
    return response.data;
}

export async function scrapeAll(): Promise<ScrapeJob> {
    const response = await api.post<ScrapeJob>('/scraper/scrape-all');
    return response.data;
}

export function useScrapeJobs(limit = 10) {
    return useSWR<ScrapeJob[]>(
        `/scraper/jobs?limit=${limit}`,
        fetcher,
        { ...defaultOptions, refreshInterval: 5000 } // Refresh every 5 seconds
    );
}

export function useScrapeJob(jobId: string) {
    return useSWR<ScrapeJob>(
        jobId ? `/scraper/jobs/${jobId}` : null,
        fetcher,
        { ...defaultOptions, refreshInterval: 2000 } // Refresh every 2 seconds while watching
    );
}

// ============ History Functions ============

export async function addToHistory(
    sessionId: string,
    path: string,
    title: string
): Promise<void> {
    await api.post('/history', { sessionId, path, title });
}

export function useHistory(sessionId: string) {
    return useSWR(
        sessionId ? `/history/${sessionId}` : null,
        fetcher,
        defaultOptions
    );
}

// Export the api instance for direct use if needed
export { api };
