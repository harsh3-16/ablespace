import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-[#AC1754] via-[#E53888] to-[#F37199] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📚</span>
                            </div>
                            <span className="text-white font-bold text-xl">Product Explorer</span>
                        </div>
                        <p className="text-white/80 max-w-md">
                            Explore millions of books from World of Books. Discover your next great read
                            with our powerful search and filtering tools.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-white/80 hover:text-white transition-colors">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-white/80 hover:text-white transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Categories</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/categories/fiction-books" className="text-white/80 hover:text-white transition-colors">
                                    Fiction
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/non-fiction-books" className="text-white/80 hover:text-white transition-colors">
                                    Non-Fiction
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories/childrens-books" className="text-white/80 hover:text-white transition-colors">
                                    Children's Books
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-white/70 text-sm">
                        © {new Date().getFullYear()} Product Explorer. Data from World of Books.
                    </p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <a href="#" className="text-white/70 hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-white/70 hover:text-white transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
