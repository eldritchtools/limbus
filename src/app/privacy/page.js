"use client";

export default function PrivacyPage() {
    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", lineHeight: 1.6 }}>
            <h1>Privacy Policy</h1>
            <p><strong>Effective date:</strong> 2026-04-23</p>

            <p>
                This website is a fan-made project and is not affiliated with any game developers or publishers.
            </p>

            <h2>Information we collect</h2>
            <p>When you sign in with Google, we may collect:</p>
            <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Google user ID</li>
            </ul>

            <p>
                We use this information only to provide login functionality, maintain user sessions, and improve site functionality.
            </p>

            <h2>Cookies and analytics</h2>
            <p>
                We use Google Analytics to understand how users interact with the website.
            </p>
            <p>
                Google Analytics may use cookies and collect information such as pages visited, device and browser type,
                approximate location (based on IP address), and usage patterns. This data is used only for analytics and site improvement.
            </p>

            <h2>Third-party services</h2>
            <p>We use third-party services to operate this website:</p>
            <ul>
                <li><strong>Google OAuth (Google Cloud)</strong> – authentication</li>
                <li><strong>Supabase</strong> – user authentication and data storage</li>
                <li><strong>Google Analytics</strong> – website usage analytics</li>
                <li><strong>Cloudflare</strong> – security, caching, and traffic protection</li>
            </ul>

            <p>
                These services may process limited personal or technical data (such as IP address, cookies, or login identifiers)
                according to their own privacy policies.
            </p>

            <h2>Data storage and retention</h2>
            <p>
                User authentication data is stored securely using Supabase. We retain data only as long as necessary to provide the service.
            </p>

            <h2>Data deletion</h2>
            <p>
                You may request deletion of your account and associated data by contacting us at: contact@eldritchtools.com
            </p>
            <p>
                We will delete user data where reasonably possible, unless required for security or legal obligations.
            </p>

            <h2>Data sharing</h2>
            <p>
                We do not sell personal data. Data is only shared with the third-party services listed above to operate the website.
            </p>

            <h2>Your rights</h2>
            <p>
                You may request access, correction, or deletion of your personal data by contacting us.
            </p>

            <h2>Contact</h2>
            <p>For any questions, contact: contact@eldritchtools.com</p>
        </main>
    );
}
