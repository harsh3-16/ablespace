'use client';

import Link from 'next/link';
import { useNavigations } from '@/lib/api';
import { CategoryGridSkeleton } from '@/components/Skeleton';

export default function CategoriesPage() {
    const { data: navigations, isLoading, error } = useNavigations();

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <section className="bg-gradient-to-r from-[#AC1754] via-[#E53888] to-[#F37199] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
                    <p className="text-xl text-white/80 max-w-2xl">
                        Explore our vast collection of books organized by genre. From fiction to non-fiction,
                        find exactly what you're looking for.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-12 bg-[#fdf2f8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <CategoryGridSkeleton count={9} />
                    ) : error ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>Unable to load categories. Please try again later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {navigations?.map((nav) => (
                                <Link
                                    key={nav.id}
                                    href={`/categories/${nav.slug}`}
                                    className="group relative h-56 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#AC1754] via-[#E53888] to-[#F37199]" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

                                    {/* Pattern overlay */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                        }} />
                                    </div>

                                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                        <div className="flex justify-between items-start">
                                            <span className="text-5xl">📚</span>
                                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                                                {nav.categories?.length || 0} subcategories
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform">
                                                {nav.title}
                                            </h2>
                                            <div className="flex items-center text-white/80">
                                                <span>Browse collection</span>
                                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
