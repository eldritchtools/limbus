'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './authProvider';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?redirectTo=${redirectTo}`);
        }
    }, [loading, user, router]);

    if (loading) {
        return <div><h2>Loading...</h2></div>;
    } else if (!user) {
        return <div><h2>Redirecting...</h2></div>;
    } else {
        return children;
    }
}
