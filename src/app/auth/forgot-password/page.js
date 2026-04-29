"use client";

import { useState } from 'react';

import { getSupabase } from '@/app/database/connection';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            console.error('Password reset error:', error.message);
            setMessage(error.message);
        } else {
            setMessage('If an account exists for this email, a reset link has been sent.');
        }

        setLoading(false);
    };

    return <main style={styles.container}>
        <div style={styles.card}>
            <h2 style={styles.title}>Forgot Password</h2>
            <p style={styles.subtitle}>
                Enter your account email, and we’ll send you a password reset link.
            </p>

            <form onSubmit={handleForgotPassword} style={styles.form}>
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={{ cursor: loading ? 'wait' : 'pointer' }} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            {message && <p style={styles.message}>{message}</p>}
        </div>
    </main>;
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1f1f1f',
        color: '#ddd',
    },
    card: {
        background: '#2a2a2a',
        border: '1px solid #555',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#aaa',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    input: {
        backgroundColor: '#1f1f1f',
        color: '#ddd',
        border: '1px solid #555',
        borderRadius: '6px',
        padding: '8px',
    },
    message: {
        marginTop: '1rem',
        textAlign: 'center',
        color: '#ccc',
    },
};
