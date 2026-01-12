'use client';

import { useEffect, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PathEntry {
    path: string;
    title: string;
    timestamp: string;
}

interface ViewHistory {
    id: string;
    sessionId: string;
    pathHistory: PathEntry[];
    lastPath: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generate a unique session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

export function useViewHistory() {
    const pathname = usePathname();
    const [history, setHistory] = useState<PathEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch existing history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            const sessionId = getSessionId();
            if (!sessionId) return;

            try {
                const res = await fetch(`${API_BASE}/history/${sessionId}`);
                if (res.ok) {
                    const data: ViewHistory = await res.json();
                    setHistory(data.pathHistory || []);
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Track page views
    const trackPageView = useCallback(async (title: string) => {
        const sessionId = getSessionId();
        if (!sessionId || !pathname) return;

        // Update local state immediately
        const newEntry: PathEntry = {
            path: pathname,
            title,
            timestamp: new Date().toISOString(),
        };
        setHistory(prev => [...prev.slice(-49), newEntry]);

        // Save to backend
        try {
            await fetch(`${API_BASE}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    path: pathname,
                    title,
                }),
            });
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }, [pathname]);

    // Clear history
    const clearHistory = useCallback(async () => {
        const sessionId = getSessionId();
        if (!sessionId) return;

        setHistory([]);

        try {
            await fetch(`${API_BASE}/history/${sessionId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }, []);

    return {
        history,
        isLoading,
        trackPageView,
        clearHistory,
        sessionId: typeof window !== 'undefined' ? getSessionId() : '',
    };
}
