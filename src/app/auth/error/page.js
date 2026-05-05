import { Suspense } from "react";

import AuthErrorContent from "./AuthErrorContent";

export default function AuthErrorPage() {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--primary-text-color)' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--secondary-border-color)', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Authentication Error</h2>
            <Suspense fallback={<div>Loading...</div>}>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}><AuthErrorContent /></p>
            </Suspense>
            <p className="sub-text">Redirecting you back to the homepage...</p>
        </div>
    </main>
}
