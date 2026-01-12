'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-[#AC1754] via-[#E53888] to-[#F37199] shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-2xl">📚</span>
                        </div>
                        <span className="text-white font-bold text-xl hidden sm:block">
                            Product Explorer
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-white/90 hover:text-white transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            href="/categories"
                            className="text-white/90 hover:text-white transition-colors font-medium"
                        >
                            Categories
                        </Link>
                        <Link
                            href="/products"
                            className="text-white/90 hover:text-white transition-colors font-medium"
                        >
                            Products
                        </Link>
                        <Link
                            href="/about"
                            className="text-white/90 hover:text-white transition-colors font-medium"
                        >
                            About
                        </Link>
                        <Link
                            href="/admin"
                            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition-colors"
                        >
                            Admin
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden lg:flex items-center">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 px-4 py-2 pl-10 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </form>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link
                            href="/"
                            className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/categories"
                            className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Categories
                        </Link>
                        <Link
                            href="/products"
                            className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Products
                        </Link>
                        <Link
                            href="/about"
                            className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/admin"
                            className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Admin
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
