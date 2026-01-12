import Link from 'next/link';
import type { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const formatPrice = (price?: number, currency?: string) => {
        if (!price) return 'Price not available';
        const symbol = currency === 'GBP' ? '£' : '$';
        return `${symbol}${price.toFixed(2)}`;
    };

    return (
        <Link href={`/products/${product.id}`} className="group">
            <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col border border-[#F7A8C4]/30">
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#fdf2f8] to-[#F7A8C4]/30 overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-30">📖</span>
                        </div>
                    )}

                    {/* Stock Badge */}
                    {!product.inStock && (
                        <div className="absolute top-3 right-3 bg-[#AC1754] text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Out of Stock
                        </div>
                    )}

                    {/* Condition Badge */}
                    {product.condition && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                            {product.condition}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#AC1754] transition-colors">
                        {product.title}
                    </h3>

                    {product.author && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                            by {product.author}
                        </p>
                    )}

                    <div className="mt-auto pt-2">
                        {/* Rating */}
                        {product.detail?.ratingsAvg && (
                            <div className="flex items-center gap-1 mb-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 ${star <= Math.round(product.detail!.ratingsAvg!)
                                                    ? 'text-[#E53888]'
                                                    : 'text-gray-200'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                    ({product.detail.reviewsCount})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-[#AC1754]">
                                {formatPrice(product.price, product.currency)}
                            </span>
                            {product.originalPrice && product.originalPrice > (product.price || 0) && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(product.originalPrice, product.currency)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
