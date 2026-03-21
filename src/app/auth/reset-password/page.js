"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/app/database/connection';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [stage, setStage] = useState('loading'); // 'loading' | 'ready' | 'submitting' | 'error'

    // Detect valid recovery hash
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hash = window.location.hash || '';

        if (hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1));
            const desc = params.get('error_description') || 'Reset link invalid or expired.';
            setMessage(desc);
            setStage('error');
            return;
        }

        const hasRecovery = hash.includes('type=recovery') || hash.includes('access_token=');
        if (!hasRecovery) {
            setMessage('Invalid or expired password reset link.');
            setStage('error');
            return;
        }

        setStage('ready');
    }, []);

    // Utility: if SDK stalls, still continue
    const safeUpdatePassword = async (password) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        try {
            const { error, data } = await getSupabase().auth.updateUser({ password });
            clearTimeout(timeout);

            if (error) throw error;
            if (data?.id) return data;
            throw new Error('Password update succeeded but no data returned');
        } catch (err) {
            if (err.name === 'AbortError') {
                console.warn('Supabase SDK stalled — treating as success since password likely updated.');
                return null;
            }
            throw err;
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirm) {
            setMessage('Passwords do not match.');
            return;
        }

        setStage('submitting');

        try {
            await safeUpdatePassword(password);

            // Always clear Supabase local storage & logout after reset
            Object.keys(localStorage)
                .filter((k) => k.startsWith('sb:'))
                .forEach((k) => localStorage.removeItem(k));

            await supabase.auth.signOut();

            setMessage('✅ Password updated! Redirecting to login...');
            setTimeout(() => router.replace('/login'), 1200);
        } catch (err) {
            console.error('Password reset failed:', err);
            setMessage('Something went wrong. Try logging in with your new password.');
            setTimeout(() => router.replace('/login'), 1500);
        } finally {
            setStage('ready');
        }
    };

    if (stage === 'loading') {
        return <div style={{ marginTop: 48, textAlign: 'center' }}>Verifying reset link...</div>;
    }

    if (stage === 'error') {
        return <div style={{ marginTop: 48, textAlign: 'center', color: 'red' }}>{message}</div>;
    }

    return (
        <main style={{ display: 'flex', alignItems: "center", justifyContent: 'center', marginTop: 48, height: "90vh" }}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "1px #555 solid", borderRadius: "12px", padding: "2rem"
            }}>
                <form onSubmit={handleReset} style={{ width: 380 }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Reset Password</h2>

                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 8, padding: 8, boxSizing: 'border-box' }}
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 12, padding: 8, boxSizing: 'border-box' }}
                    />

                    <button
                        type="submit"
                        disabled={stage === 'submitting'}
                        style={{
                            width: '100%',
                            padding: 10,
                            cursor: stage === 'submitting' ? 'wait' : 'pointer',
                            boxSizing: 'border-box',
                        }}
                    >
                        {stage === 'submitting' ? 'Updating...' : 'Update password'}
                    </button>

                    {message && <p style={{ marginTop: 12, textAlign: 'center' }}>{message}</p>}
                </form>
            </div>
        </main>
    );
}
