import { Suspense } from "react";
import AuthErrorContent from "./AuthErrorContent";

export default function AuthErrorPage() {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1f1f1f', color: '#ddd' }}>
        <div style={{ background: '#2a2a2a', border: '1px solid #555', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Authentication Error</h2>
            <Suspense fallback={<div>Loading...</div>}>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}><AuthErrorContent /></p>
            </Suspense>
            <p style={{ fontSize: '0.875rem', color: '#aaa' }}>Redirecting you back to the homepage...</p>
        </div>
    </main>
}
