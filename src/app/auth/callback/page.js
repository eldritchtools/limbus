'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/database/authProvider';
import { localStores } from '@/app/database/localDB';

export default function AuthCallback() {
    const router = useRouter();
    const { user, profile, loading, refreshProfile } = useAuth();

    useEffect(() => {
        // wait for AuthProvider to finish loading
        if (loading) return;

        // if still no user after loading, auth failed or expired
        if (!user) {
            router.replace('/login');
            return;
        }

        // If user has no profile, they’re new → setup flow
        if (!profile || !profile.username || profile.username.trim().length === 0) {
            (async () => router.replace('/login/setup'))();
            return;
        }

        const checkLocalData = async () => {
            if (Object.entries(localStores).some(([, store]) => !store.isEmpty())) {
                (async () => router.replace('/login/setup'))();
                return;
            }

            finishAuth();
        }

        const finishAuth = () => {
            // Otherwise, existing user → go home
            const searchParams = new URLSearchParams(window.location.search);
            const state = searchParams.get('state');
            router.replace(state || '/');
        }

        checkLocalData();
    }, [loading, user, profile, router, refreshProfile]);

    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Authenticating...</p>;
}
