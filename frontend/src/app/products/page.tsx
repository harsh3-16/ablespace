'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/lib/api';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { HistoryTracker } from '@/components/ViewHistory';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const urlSearch = searchParams.get('search') || '';

    const [searchQuery, setSearchQuery] = useState(urlSearch);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<'title' | 'price' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    // Update search when URL changes
    useEffect(() => {
        setSearchQuery(urlSearch);
        setPage(1);
    }, [urlSearch]);

    const { data, isLoading, error } = useProducts({
        page,
        limit: 12,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
    });

    const products = data?.data || [];
    const meta = data?.meta;

    return (
        <>
            <HistoryTracker title="Products" />
            <div className="animate-fadeIn">
                {/* Header */}
                <section className="bg-gradient-to-r from-[#AC1754] via-[#E53888] to-[#F37199] text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold mb-4">All Products</h1>
                        <p className="text-xl text-white/80 max-w-2xl">
                            Browse our complete collection of books. Use filters to find exactly what you're looking for.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-12 bg-[#fdf2f8]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar Filters */}
                            <aside className="lg:w-64 flex-shrink-0">
                                <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 border border-[#F7A8C4]/30">
                                    <h2 className="font-bold text-lg mb-4 text-[#AC1754]">Filters</h2>

                                    {/* Search */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                        <input
                                            type="text"
                                            placeholder="Search books..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-full px-4 py-2 bg-white text-gray-900 border border-[#F7A8C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53888] placeholder-gray-400"
                                        />
                                    </div>

                                    {/* Sort */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [field, order] = e.target.value.split('-') as ['title' | 'price' | 'createdAt', 'ASC' | 'DESC'];
                                                setSortBy(field);
                                                setSortOrder(order);
                                            }}
                                            className="w-full px-4 py-2 bg-white text-gray-900 border border-[#F7A8C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53888]"
                                        >
                                            <option value="createdAt-DESC">Newest First</option>
                                            <option value="createdAt-ASC">Oldest First</option>
                                            <option value="price-ASC">Price: Low to High</option>
                                            <option value="price-DESC">Price: High to Low</option>
                                            <option value="title-ASC">Title: A-Z</option>
                                            <option value="title-DESC">Title: Z-A</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setPage(1);
                                            setSortBy('createdAt');
                                            setSortOrder('DESC');
                                        }}
                                        className="w-full py-2 text-[#AC1754] border border-[#AC1754] rounded-lg hover:bg-[#AC1754] hover:text-white transition-all"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </aside>

                            {/* Products Grid */}
                            <div className="flex-1">
                                {/* Results count */}
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-gray-600">
                                        {meta ? `${meta.total} products found` : 'Loading...'}
                                    </span>
                                </div>

                                {/* Grid */}
                                {isLoading ? (
                                    <ProductGridSkeleton count={12} />
                                ) : error ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>Unable to load products. Please try again later.</p>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No products found. Try adjusting your filters.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {products.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.id}`}
                                                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-[#F7A8C4]/30"
                                            >
                                                <div className="aspect-[3/4] bg-gradient-to-br from-[#fdf2f8] to-[#F7A8C4]/30 flex items-center justify-center overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-6xl opacity-30">📖</span>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#AC1754] transition-colors">
                                                        {product.title}
                                                    </h3>
                                                    {product.author && (
                                                        <p className="text-sm text-gray-500 mb-2">{product.author}</p>
                                                    )}
                                                    <p className="text-lg font-bold text-[#AC1754]">
                                                        {product.currency === 'GBP' ? '£' : '$'}{product.price ? parseFloat(String(product.price)).toFixed(2) : 'N/A'}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {meta && meta.totalPages > 1 && (
                                    <div className="flex justify-center mt-12">
                                        <nav className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={!meta.hasPrevPage}
                                                className="px-4 py-2 bg-[#F7A8C4]/30 text-gray-600 rounded-lg hover:bg-[#F7A8C4]/50 transition-colors disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-4 py-2 text-gray-600">
                                                Page {meta.page} of {meta.totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={!meta.hasNextPage}
                                                className="px-4 py-2 bg-[#F7A8C4]/30 text-gray-600 rounded-lg hover:bg-[#F7A8C4]/50 transition-colors disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
