'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from './connection';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({ user: null, profile: null, loading: true, refreshProfile: () => { }, updateUsername: () => { }, logout: () => { } });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadProfile = useCallback(async userId => {
        const promise = getSupabase()
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        promise.then(({ error, data }) => {
            setLoading(false);
            if (error) throw error;
            setProfile(data);
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const desc = params.get('error_description');
            // Redirect to the error page with the message in the URL
            window.location.href = `/auth/error?message=${encodeURIComponent(desc || 'Authentication link invalid or expired.')}`;
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data, error } = await getSupabase().auth.getSession();
            if (error) console.error(error);
            setLoading(true);
            const session = data?.session;
            const currentUser = session?.user ?? null;

            setUser(currentUser);
            if (currentUser) await loadProfile(currentUser.id);
            else setLoading(false);
        };
        init();

        const { data: listener } = getSupabase().auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    const currentUser = session?.user ?? null;
                    if (user?.id !== session?.user?.id) setUser(currentUser);
                    if (currentUser) loadProfile(currentUser.id).then(_ => { });
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        return () => listener.subscription.unsubscribe();
    }, [user?.id, loadProfile]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                try {
                    await getSupabase().auth.refreshSession();
                } catch {
                    console.warn("Reauth failed, signing out.");
                    await getSupabase().auth.signOut();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    const updateUsername = async (id, username) => {
        const { data, error } = await getSupabase()
            .from("users")
            .update({ username })
            .eq("id", id)
            .select()
            .single();

        if (!error) await loadProfile(id);
        return { data, error };
    }

    const logout = async () => {
        await getSupabase().auth.signOut();
        setUser(null);
        setProfile(null);
        router.refresh();
    };

    const value = {
        user,
        profile,
        loading,
        refreshProfile: () => user && loadProfile(user.id),
        updateUsername,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
