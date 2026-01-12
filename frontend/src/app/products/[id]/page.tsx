'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProduct, useRecommendedProducts } from '@/lib/api';
import { ProductDetailSkeleton, ProductGridSkeleton } from '@/components/Skeleton';
import { HistoryTracker } from '@/components/ViewHistory';

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as string;

    const { data: product, isLoading, error } = useProduct(productId);
    const { data: recommendations } = useRecommendedProducts(productId);

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <Link href="/products" className="text-[#AC1754] hover:underline">
                        Browse all products
                    </Link>
                </div>
            </div>
        );
    }

    const detail = product.detail;
    const reviews = product.reviews || [];

    return (
        <>
            <HistoryTracker title={product.title} />
            <div className="animate-fadeIn bg-[#fdf2f8]">
                <div className="bg-[#F7A8C4]/30 py-4">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Link href="/" className="text-gray-600 hover:text-[#AC1754]">Home</Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/products" className="text-gray-600 hover:text-[#AC1754]">Products</Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-[#AC1754] font-medium">{product.title}</span>
                        </div>
                    </div>
                </div>

                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="bg-gradient-to-br from-[#F7A8C4]/20 to-[#F37199]/20 rounded-2xl aspect-[3/4] flex items-center justify-center border border-[#F7A8C4]/30 overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-9xl opacity-30">📖</span>
                                )}
                            </div>

                            <div>
                                <span className={`inline-block text-sm px-3 py-1 rounded-full mb-4 ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.title}</h1>
                                {product.author && <p className="text-xl text-gray-600 mb-4">by {product.author}</p>}

                                {detail?.ratingsAvg && (
                                    <div className="flex items-center gap-2 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <svg key={s} className={`w-5 h-5 ${s <= Math.round(detail.ratingsAvg!) ? 'text-[#E53888]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="text-gray-600">{detail.ratingsAvg} ({detail.reviewsCount} reviews)</span>
                                    </div>
                                )}

                                <div className="flex items-baseline gap-4 mb-8">
                                    <span className="text-4xl font-bold text-[#AC1754]">
                                        {product.currency === 'GBP' ? '£' : '$'}{product.price ? parseFloat(String(product.price)).toFixed(2) : 'N/A'}
                                    </span>
                                    {product.originalPrice && product.originalPrice > (product.price || 0) && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">
                                                {product.currency === 'GBP' ? '£' : '$'}{parseFloat(String(product.originalPrice)).toFixed(2)}
                                            </span>
                                            <span className="bg-[#F7A8C4] text-[#AC1754] text-sm px-2 py-1 rounded">
                                                Save {Math.round((1 - (product.price || 0) / product.originalPrice) * 100)}%
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Description - right after price */}
                                {detail?.description && (
                                    <div className="mb-6">
                                        <p className="text-gray-600 leading-relaxed line-clamp-4">{detail.description}</p>
                                        <button
                                            className="text-[#AC1754] text-sm font-medium mt-2 hover:underline"
                                            onClick={() => {
                                                const el = document.getElementById('full-description');
                                                el?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            Read more ↓
                                        </button>
                                    </div>
                                )}

                                <a
                                    href={product.sourceUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 text-center bg-gradient-to-r from-[#AC1754] to-[#E53888] text-white font-semibold rounded-xl hover:from-[#8c1244] hover:to-[#d42d78] transition-all mb-6"
                                >
                                    View on World of Books
                                </a>

                                {/* Product Specifications */}
                                <div className="bg-white rounded-xl p-5 border border-[#F7A8C4]/30">
                                    <h2 className="font-bold text-lg text-gray-900 mb-4">Product Specifications</h2>
                                    <div className="space-y-3">
                                        {detail?.isbn && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">📖</span> ISBN
                                                </span>
                                                <span className="font-medium text-gray-800">{detail.isbn}</span>
                                            </div>
                                        )}
                                        {detail?.format && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">📚</span> Format
                                                </span>
                                                <span className="font-medium text-gray-800">{detail.format}</span>
                                            </div>
                                        )}
                                        {detail?.publisher && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">🏢</span> Publisher
                                                </span>
                                                <span className="font-medium text-gray-800">{detail.publisher}</span>
                                            </div>
                                        )}
                                        {detail?.publicationDate && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">📅</span> Published
                                                </span>
                                                <span className="font-medium text-gray-800">{detail.publicationDate}</span>
                                            </div>
                                        )}
                                        {detail?.pages && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">📄</span> Pages
                                                </span>
                                                <span className="font-medium text-gray-800">{detail.pages}</span>
                                            </div>
                                        )}
                                        {detail?.language && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">🌐</span> Language
                                                </span>
                                                <span className="font-medium text-gray-800">{detail.language}</span>
                                            </div>
                                        )}
                                        {product.condition && (
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-gray-500 flex items-center gap-2">
                                                    <span className="text-lg">✨</span> Condition
                                                </span>
                                                <span className="font-medium text-gray-800">{product.condition}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Description Section */}
                        {detail?.description && (
                            <div id="full-description" className="mt-12 bg-white rounded-2xl p-8 border border-[#F7A8C4]/30">
                                <h2 className="font-bold text-xl text-gray-900 mb-4">About This Book</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{detail.description}</p>
                            </div>
                        )}

                        {reviews.length > 0 && (
                            <div className="mt-12">
                                <h2 className="font-bold text-xl text-[#AC1754] mb-6">Reviews</h2>
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div key={r.id} className="bg-white rounded-2xl p-6 border border-[#F7A8C4]/30">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-semibold">{r.author}</span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <svg key={s} className={`w-4 h-4 ${s <= (r.rating || 0) ? 'text-[#E53888]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600">{r.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recommendations && recommendations.length > 0 && (
                            <div className="mt-12">
                                <h2 className="font-bold text-xl text-[#AC1754] mb-6">You May Also Like</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {recommendations.map(rec => (
                                        <Link key={rec.id} href={`/products/${rec.id}`} className="group bg-white rounded-2xl overflow-hidden border border-[#F7A8C4]/30 hover:shadow-lg transition-all">
                                            <div className="aspect-[3/4] bg-gradient-to-br from-[#fdf2f8] to-[#F7A8C4]/30 flex items-center justify-center">
                                                {rec.imageUrl ? (
                                                    <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-5xl opacity-30">📖</span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold group-hover:text-[#AC1754] line-clamp-2">{rec.title}</h3>
                                                {rec.author && <p className="text-sm text-gray-500">{rec.author}</p>}
                                                <p className="font-bold text-[#AC1754]">{rec.currency === 'GBP' ? '£' : '$'}{rec.price ? parseFloat(String(rec.price)).toFixed(2) : 'N/A'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
