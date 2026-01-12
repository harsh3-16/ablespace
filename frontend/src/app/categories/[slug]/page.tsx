'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCategory, useProducts } from '@/lib/api';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { useState } from 'react';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [page, setPage] = useState(1);

    const { data: category, isLoading: categoryLoading } = useCategory(slug);
    const { data: productsData, isLoading: productsLoading } = useProducts({
        page,
        limit: 12,
        categoryId: category?.id,
    });

    const products = productsData?.data || [];
    const meta = productsData?.meta;
    const isLoading = categoryLoading || productsLoading;

    const displayTitle = category?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <section className="bg-gradient-to-r from-[#AC1754] via-[#E53888] to-[#F37199] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-white/80 mb-4">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span>/</span>
                        <Link href="/categories" className="hover:text-white">Categories</Link>
                        <span>/</span>
                        <span className="text-white">{displayTitle}</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>
                    <p className="text-xl text-white/80 max-w-2xl">
                        Browse our collection of quality books in this category.
                    </p>
                </div>
            </section>

            {/* Products */}
            <section className="py-12 bg-[#fdf2f8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Results count */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <span className="text-gray-600">
                            {meta ? `${meta.total} products found` : 'Loading...'}
                        </span>
                    </div>

                    {/* Products Grid */}
                    {isLoading ? (
                        <ProductGridSkeleton count={12} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No products found in this category yet.</p>
                            <Link href="/products" className="text-[#AC1754] hover:underline mt-2 inline-block">
                                Browse all products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            </section>
        </div>
    );
}
