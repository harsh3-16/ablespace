 
import Link from 'next/link';
import type { Category } from '@/types';

interface CategoryCardProps {
    category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/categories/${category.slug}`} className="group">
            <article className="relative bg-gradient-to-br from-[#AC1754] via-[#E53888] to-[#F37199] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-48">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Image Overlay */}
                {category.imageUrl && (
                    <img
                        src={category.imageUrl}
                        alt={category.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                    />
                )}

                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-end">
                    <h3 className="text-white text-xl font-bold mb-1 group-hover:translate-x-1 transition-transform">
                        {category.title}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">
                            {category.productCount > 0
                                ? `${category.productCount.toLocaleString()} products`
                                : 'Browse collection'
                            }
                        </span>
                        <span className="text-white/80 group-hover:translate-x-1 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
