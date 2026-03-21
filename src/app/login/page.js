'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './LoginPage.css';
import { getSupabase } from '../database/connection';
import NoPrefetchLink from '../components/objects/NoPrefetchLink';

function AuthForm() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirectTo, setRedirectTo] = useState('/');

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirectTo');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (redirect) setRedirectTo(redirect);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!isLogin && password !== confirm) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);
        document.body.style.cursor = "wait";
        document.body.style.pointerEvents = "none";

        const { error } = isLogin
            ? await getSupabase().auth.signInWithPassword({ email, password })
            : await getSupabase().auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

        setLoading(false);
        document.body.style.cursor = "default";
        document.body.style.pointerEvents = "auto";

        if (error) {
            setMessage(error.message);
            return;
        }

        if (!isLogin) {
            alert('Signed up! Check your inbox for a verification email.');
            window.location.reload();
        } else {
            router.push(`/auth/callback?state=${redirectTo}`);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        document.body.style.cursor = "wait";
        document.body.style.pointerEvents = "none";
        const { error } = await getSupabase().auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
                // queryParams: { state: redirectTo }
            },
        });

        setLoading(false);
        document.body.style.cursor = "default";
        document.body.style.pointerEvents = "auto";
        if (error) console.error('Google sign-in error:', error.message);
    };

    return (
        <div
            style={{
                maxWidth: '24rem',
                margin: '0 auto',
                padding: '1.25rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '10px',
                border: '1px solid #555',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                color: '#ddd',
            }}
        >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem', textAlign: 'center' }} >
                {isLogin ? 'Login' : 'Sign Up'}
            </h2>
            <div style={{ fontSize: "0.8rem", marginBottom: "0.75rem", textAlign: "center" }}>(Authentication via Supabase)</div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {isLogin ? (
                    <div style={{ display: "flex", justifyContent: "end" }}>
                        <NoPrefetchLink className="text-link" href="/auth/forgot-password" style={{ textAlign: 'right', fontSize: "0.8rem" }}>
                            Forgot your password?
                        </NoPrefetchLink>
                    </div>
                ) : <input type="password" placeholder="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button type="submit" disabled={loading}>
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </div>
            </form>

            <div style={{ margin: '1rem 0', textAlign: 'center', color: '#aaa' }}>OR</div>

            <button onClick={handleGoogleLogin} className="google-button">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                    fill="currentColor"
                    style={{ width: '1.25rem', height: '1.25rem' }}
                >
                    <path d="M488 261.8C488 403.3 391.1 512 248 512 110.8 512 0 401.2 0 264S110.8 16 248 16c66.8 0 123 24.6 166.3 65L347 147c-24.4-23.3-55.7-37.5-99-37.5-84.3 0-153 68.5-153 153.3s68.7 153.3 153 153.3c97.7 0 134.3-70 140-106H248v-85h240a208 208 0 010 36.7z" />
                </svg>
                Continue with Google
            </button>

            <p style={{ marginTop: '0.75rem', color: '#ccc', fontSize: '0.875rem', textAlign: 'center' }}>
                {isLogin ? 'Need an account?' : 'Already have one?'}{' '}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className='signup-button'
                >
                    {isLogin ? 'Sign up' : 'Login'}
                </button>
            </p>

            {message && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ff6b6b', textAlign: 'center' }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1f1f1f',
                color: '#ddd',
            }}
        >
            <AuthForm />
        </main>
    );
}
