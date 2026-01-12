'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useViewHistory } from '@/hooks/useViewHistory';

interface HistoryTrackerProps {
    title: string;
}

// Component to track page views (invisible)
export function HistoryTracker({ title }: HistoryTrackerProps) {
    const { trackPageView } = useViewHistory();

    useEffect(() => {
        trackPageView(title);
    }, [title, trackPageView]);

    return null;
}

// Component to display recent history
export function RecentHistory() {
    const { history, isLoading, clearHistory } = useViewHistory();

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-4 border border-[#F7A8C4]/30">
                <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return null;
    }

    // Show last 5 entries (reverse to show newest first)
    const recentHistory = [...history].reverse().slice(0, 5);

    return (
        <div className="bg-white rounded-xl p-4 border border-[#F7A8C4]/30">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Recent Pages</h3>
                <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-[#AC1754] transition-colors"
                >
                    Clear
                </button>
            </div>
            <ul className="space-y-2">
                {recentHistory.map((entry, index) => (
                    <li key={`${entry.path}-${index}`}>
                        <Link
                            href={entry.path}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#AC1754] transition-colors"
                        >
                            <span className="text-[#E53888]">→</span>
                            <span className="truncate">{entry.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
