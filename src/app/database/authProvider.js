'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { getSupabase } from './connection';

const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
    refreshProfile: () => { },
    updateUsername: () => { },
    logout: () => { }
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await getSupabase()
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const desc = params.get('error_description');

            window.location.href = `/auth/error?message=${encodeURIComponent(
                desc || 'Authentication link invalid or expired.'
            )}`;
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const supabase = getSupabase();

        const init = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) console.error(error);
            if (!mounted) return;

            const session = data?.session;
            const currentUser = session?.user ?? null;

            setUser(currentUser);

            if (currentUser) {
                await loadProfile(currentUser.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const currentUser = session?.user ?? null;

                setUser(currentUser);

                if (currentUser) {
                    loadProfile(currentUser.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, [loadProfile]);

    // ----------------------------
    // User actions
    // ----------------------------

    const updateUsername = async (id, username) => {
        const { data, error } = await getSupabase()
            .from('users')
            .update({ username })
            .eq('id', id)
            .select()
            .single();

        if (!error) await loadProfile(id);

        return { data, error };
    };

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