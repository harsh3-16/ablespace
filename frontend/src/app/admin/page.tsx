'use client';

import { useState } from 'react';
import { triggerScrape, useScrapeJobs } from '@/lib/api';

export default function AdminPage() {
    const [url, setUrl] = useState('https://www.worldofbooks.com/en-gb/category/fiction');
    const [targetType, setTargetType] = useState<'navigation' | 'category' | 'product_list' | 'product_detail'>('category');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { data: jobs, mutate: refreshJobs } = useScrapeJobs(10);

    const handleScrape = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const job = await triggerScrape(url, targetType, false);
            setMessage(`Scrape job started! Job ID: ${job.id}`);
            refreshJobs();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start scrape';
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdf2f8] py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-[#AC1754] mb-8">Admin - Scraper Control</h1>

                {/* Scrape Form */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-[#F7A8C4]/30">
                    <h2 className="text-xl font-semibold text-[#AC1754] mb-4">Trigger Scrape</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target URL
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.worldofbooks.com/..."
                                className="w-full px-4 py-2 bg-white text-gray-900 border border-[#F7A8C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53888] placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Type
                            </label>
                            <select
                                value={targetType}
                                onChange={(e) => setTargetType(e.target.value as any)}
                                className="w-full px-4 py-2 bg-white text-gray-900 border border-[#F7A8C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53888]"
                            >
                                <option value="navigation">Navigation (Main headings)</option>
                                <option value="category">Category (Subcategories)</option>
                                <option value="product_list">Product List (Products from category)</option>
                                <option value="product_detail">Product Detail (Single product)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleScrape}
                            disabled={isLoading || !url}
                            className="w-full py-3 bg-gradient-to-r from-[#AC1754] to-[#E53888] text-white font-semibold rounded-lg hover:from-[#8c1244] hover:to-[#d42d78] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Starting Scrape...' : 'Start Scrape'}
                        </button>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6 pt-6 border-t border-[#F7A8C4]/30">
                        <h3 className="font-medium text-gray-700 mb-2">Quick URLs:</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Fiction', url: 'https://www.worldofbooks.com/en-gb/category/fiction' },
                                { label: 'Non-Fiction', url: 'https://www.worldofbooks.com/en-gb/category/non-fiction' },
                                { label: "Children's", url: 'https://www.worldofbooks.com/en-gb/category/childrens' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setUrl(item.url)}
                                    className="px-3 py-1 text-sm bg-[#F7A8C4]/30 text-[#AC1754] rounded-full hover:bg-[#F7A8C4]/50 transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Jobs */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-[#F7A8C4]/30">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-[#AC1754]">Recent Scrape Jobs</h2>
                        <button
                            onClick={() => refreshJobs()}
                            className="px-3 py-1 text-sm bg-[#F7A8C4]/30 text-[#AC1754] rounded-lg hover:bg-[#F7A8C4]/50 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>

                    {!jobs || jobs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No scrape jobs yet</p>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job) => (
                                <div key={job.id} className="p-4 bg-[#fdf2f8] rounded-lg border border-[#F7A8C4]/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                job.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {job.status}
                                            </span>
                                            <p className="mt-1 text-sm text-gray-600 truncate max-w-md">{job.targetUrl}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(job.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {job.errorLog && (
                                        <p className="mt-2 text-sm text-red-600">{job.errorLog}</p>
                                    )}
                                    {job.itemsScraped !== undefined && job.itemsScraped > 0 && (
                                        <p className="mt-1 text-sm text-gray-600">Items scraped: {job.itemsScraped}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
