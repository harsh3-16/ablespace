'use client';

import Link from 'next/link';
import { useNavigations } from '@/lib/api';
import { ProductGridSkeleton, CategoryGridSkeleton } from '@/components/Skeleton';
import { HistoryTracker } from '@/components/ViewHistory';

export default function HomePage() {
  const { data: navigations, isLoading, error } = useNavigations();

  return (
    <div className="animate-fadeIn">
      <HistoryTracker title="Home" />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#AC1754] via-[#E53888] to-[#F37199] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Discover Your Next
              <br />
              <span className="text-[#F7A8C4]">Great Read</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Explore millions of books from World of Books. From classics to bestsellers,
              find your perfect book at unbeatable prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-4 bg-white text-[#AC1754] font-semibold rounded-full hover:bg-[#F7A8C4] hover:text-[#AC1754] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse All Books
              </Link>
              <Link
                href="/categories"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className="w-full h-12 md:h-24">
            <path fill="#fdf2f8" d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#fdf2f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#F7A8C4]/30">
              <div className="text-3xl font-bold text-[#AC1754]">1M+</div>
              <div className="text-gray-500">Books Available</div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#F7A8C4]/30">
              <div className="text-3xl font-bold text-[#E53888]">50+</div>
              <div className="text-gray-500">Categories</div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#F7A8C4]/30">
              <div className="text-3xl font-bold text-[#F37199]">£1.00</div>
              <div className="text-gray-500">Starting From</div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#F7A8C4]/30">
              <div className="text-3xl font-bold text-[#AC1754]">Free</div>
              <div className="text-gray-500">Delivery Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#fdf2f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
              <p className="text-gray-500 mt-1">Find books by genre</p>
            </div>
            <Link href="/categories" className="text-[#AC1754] font-semibold hover:text-[#E53888] flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <CategoryGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12 text-gray-500">
              <p>Unable to load categories. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {navigations?.slice(0, 6).map((nav) => (
                <Link
                  key={nav.id}
                  href={`/categories/${nav.slug}`}
                  className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#AC1754] via-[#E53888] to-[#F37199]" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  <div className="relative h-full p-6 flex flex-col justify-end text-white">
                    <h3 className="text-xl font-bold mb-1">{nav.title}</h3>
                    <p className="text-white/80">{nav.categories?.length || 0} subcategories</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-[#F7A8C4]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#AC1754]">
            Ready to Start Exploring?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover millions of books at amazing prices. Your next adventure awaits!
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#AC1754] to-[#E53888] text-white font-semibold rounded-full hover:from-[#8c1244] hover:to-[#d42d78] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Browsing Now
          </Link>
        </div>
      </section>
    </div>
  );
}
