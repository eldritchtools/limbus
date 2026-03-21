'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthErrorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Redirect back home after a short delay
        const timer = setTimeout(() => router.push('/'), 4000);
        return () => clearTimeout(timer);
    }, [router]);

    return searchParams.get('message') || 'An authentication error occurred.'
}
