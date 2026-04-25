'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '../database/authProvider';

export default function MyProfileRoute({ }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            const timer = setTimeout(() => {
                router.push("/");
            }, 2000);

            return () => clearTimeout(timer);
        }
        router.push(`/profiles/${profile.username}`);
    }, [loading, user, profile, router]);

    if (loading) {
        return <div><h2>Loading...</h2></div>;
    } else if (!user) {
        return <div><h2>Not logged in. Redirecting to homepage...</h2></div>;
    } else {
        return <div><h2>Loading profile page...</h2></div>;
    }
}
