"use client";

export default function TermsPage() {
    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", lineHeight: 1.6 }}>
            <h1>Terms of Service</h1>
            <p><strong>Effective date:</strong> 2026-04-23</p>

            <p>
                This website is a fan-made project and is not affiliated with any game developers or publishers.
            </p>

            <h2>Use of the service</h2>
            <p>
                By using this website, you agree to use it only for lawful purposes and in a way that does not
                violate the rights of others or interfere with the operation of the service.
            </p>

            <h2>Accounts</h2>
            <p>
                Some features require signing in with Google. You are responsible for maintaining the security
                of your account and for any activity under your account.
            </p>

            <p>
                We use Google Sign-In provided by Google Cloud for authentication and Supabase for account management.
            </p>

            <h2>Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
                <li>Attempt to disrupt or overload the service</li>
                <li>Use the service for illegal or harmful activities</li>
                <li>Attempt to access accounts or data that do not belong to you</li>
            </ul>

            <h2>Service availability</h2>
            <p>
                The service is provided “as is” and may be modified, suspended, or discontinued at any time
                without notice.
            </p>

            <h2>Third-party services</h2>
            <p>
                This website relies on third-party services including:
            </p>
            <ul>
                <li>Google OAuth (Google Cloud) for authentication</li>
                <li>Supabase for user authentication and data storage</li>
                <li>Cloudflare for security and traffic protection</li>
            </ul>

            <h2>Disclaimer</h2>
            <p>
                This service is provided without warranties of any kind. We are not responsible for any damages
                resulting from the use or inability to use the website.
            </p>

            <h2>Termination</h2>
            <p>
                We reserve the right to restrict or terminate access to the service if users violate these terms.
            </p>

            <h2>Contact</h2>
            <p>For questions about these Terms, contact: contact@eldritchtools.com</p>
        </main>
    );
}
