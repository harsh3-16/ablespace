export default function AboutPage() {
    return (
        <div className="animate-fadeIn">
            {/* Hero */}
            <section className="bg-gradient-to-r from-[#AC1754] via-[#E53888] to-[#F37199] text-white py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About Product Explorer</h1>
                    <p className="text-xl text-white/80">
                        Your gateway to discovering amazing books from World of Books
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-[#fdf2f8]">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Mission */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-[#AC1754] mb-4">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Product Explorer is a demonstration project showcasing modern web development techniques
                            for building a product exploration platform. We aggregate book data from World of Books
                            to provide an intuitive browsing experience.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            This project demonstrates full-stack development with Next.js, NestJS, PostgreSQL,
                            and modern web scraping techniques using Playwright and Crawlee.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-[#AC1754] mb-6">Key Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { icon: '🔍', title: 'Smart Search', desc: 'Search books by title, author, or ISBN' },
                                { icon: '📚', title: 'Category Browsing', desc: 'Explore books organized by genre' },
                                { icon: '⭐', title: 'Reviews & Ratings', desc: 'See what others think about books' },
                                { icon: '💰', title: 'Price Comparison', desc: 'Find the best deals on books' },
                                { icon: '📖', title: 'Detailed Information', desc: 'Get all the details before you buy' },
                                { icon: '🚀', title: 'Fast & Responsive', desc: 'Lightning fast, works on all devices' },
                            ].map((feature) => (
                                <div key={feature.title} className="bg-white rounded-xl p-6 shadow-md border border-[#F7A8C4]/30">
                                    <span className="text-3xl mb-3 block">{feature.icon}</span>
                                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-[#AC1754] mb-6">Technology Stack</h2>
                        <div className="bg-white rounded-2xl p-8 border border-[#F7A8C4]/30">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-[#AC1754] mb-3">Frontend</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Next.js 14 (App Router)</li>
                                        <li>• React 18</li>
                                        <li>• TypeScript</li>
                                        <li>• Tailwind CSS</li>
                                        <li>• SWR for data fetching</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#E53888] mb-3">Backend</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• NestJS</li>
                                        <li>• PostgreSQL</li>
                                        <li>• TypeORM</li>
                                        <li>• Crawlee + Playwright</li>
                                        <li>• Swagger/OpenAPI</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-[#F7A8C4]/30 border border-[#E53888] rounded-xl p-6">
                        <h3 className="font-semibold text-[#AC1754] mb-2">⚠️ Disclaimer</h3>
                        <p className="text-gray-700 text-sm">
                            This is a demonstration project. All product data is sourced from World of Books
                            for educational purposes. To purchase books, please visit the official World of Books website.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
