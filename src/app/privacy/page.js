"use client";

import NoPrefetchLink from "../components/NoPrefetchLink";

export default function PrivacyPage() {
    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", lineHeight: 1.6 }}>
            <h1>Privacy Policy</h1>

            <p><strong>Effective date: August 11, 2026</strong></p>

            <p>Eldritch Tools is a fan-made project and is not affiliated with, endorsed by, or sponsored by Project Moon or the publishers of Limbus Company.</p>

            <p>This Privacy Policy explains what information Eldritch Tools may receive when you use the Limbus Company Tools website and how that information is used.</p>

            <h2>Information we collect</h2>

            <h3>Account and profile information</h3>

            <p>Some features require an account. You may sign in using Google or Discord.</p>

            <p>When you authenticate through one of these providers, we receive the account information provided through the authentication service, such as your display name, email address, and provider-specific user identifier. We use this information to create and manage your Eldritch Tools account, maintain your session, and provide account features.</p>

            <p>You may also choose to provide information for your profile, including:</p>

            <ul>
                <li>Username</li>
                <li>Flair</li>
                <li>Profile description</li>
                <li>Profile picture</li>
                <li>Social media or other links</li>
            </ul>

            <p>Except for your username, these profile fields are optional.</p>

            <h3>User-created content</h3>

            <p>If you use community features, we may store information and content that you choose to submit, such as:</p>

            <ul>
                <li>Team builds</li>
                <li>Mirror Dungeon plans</li>
                <li>Collections</li>
                <li>Ratings and reviews</li>
                <li>Comments</li>
                <li>Encounter clear records</li>
                <li>Poll or survey responses</li>
                <li>Community assets</li>
                <li>Other content associated with these features</li>
            </ul>

            <p>Some content, such as comments and reviews, is public by nature. Other content may initially be saved as a draft and only becomes publicly visible when you choose to publish it.</p>

            <h3>Saved settings</h3>

            <p>Some site customization settings can optionally be saved to your account so that they can be synchronized between devices.</p>

            <p>Other tool settings and usage-related information may be stored locally in your browser. Information stored only in your browser is not sent to or stored by Eldritch Tools.</p>

            <h2>Uploaded images</h2>

            <p>Certain features allow you to upload images, including community assets, images associated with builds, Mirror Dungeon plans, collections, and encounter clear records.</p>

            <p>Uploaded images are stored separately from the site&apos;s database using Cloudflare R2. Images used by public features are publicly accessible.</p>

            <p>Images may be temporarily stored while an upload is being validated or processed. At present, Eldritch Tools does not guarantee that temporary or orphaned uploaded images are automatically removed.</p>

            <p>Deleting an account or database record does not necessarily delete an associated image from file storage. Uploaded images stored separately in Cloudflare R2 may therefore remain after the associated account or content has been deleted.</p>

            <h2>Analytics</h2>

            <p>We use Google Analytics to understand how the website is used and to improve its features.</p>

            <p>Google Analytics may collect standard analytics information such as pages visited, device and browser information, approximate location, and usage patterns. Eldritch Tools also sends a small number of anonymous events, such as when an account is created or content is submitted. These events describe what happened and do not intentionally include your account name, email address, or other account information.</p>

            <p>Google may process this information according to its own policies.</p>

            <h2>Realtime features</h2>

            <p>Some features use realtime connections to provide multiplayer rooms, community chat, and other interactive functionality. These features can be used without an account.</p>

            <p>Realtime functionality may process information such as a temporary connection identifier, room membership, messages, and temporary room or feature state.</p>

            <p>Realtime information is generally held in memory and is not stored in Eldritch Tools&apos; persistent database. Global chat may retain a limited number of recent messages in memory while the realtime service is running. Other room state is discarded when the relevant room is terminated.</p>

            <p>For logged-in users, a connection may use the user&apos;s Eldritch Tools account identifier as a temporary client identifier. Unauthenticated users are assigned a randomly generated identifier. These identifiers are not stored by Eldritch Tools as persistent user data.</p>

            <h2>Third-party services</h2>

            <p>Eldritch Tools relies on third-party services to operate the website. These services may process information necessary to provide their respective services according to their own privacy policies.</p>

            <ul>
                <li><strong>Google</strong> &mdash; authentication and website analytics</li>
                <li><strong>Discord</strong> &mdash; authentication</li>
                <li><strong>Supabase</strong> &mdash; authentication and database storage</li>
                <li><strong>Cloudflare</strong> &mdash; DNS, CDN, security, infrastructure, and file storage through Cloudflare R2</li>
                <li><strong>Gigalixir</strong> &mdash; hosting for realtime functionality</li>
                <li><strong>Resend</strong> &mdash; delivery of authentication-related emails, such as account confirmation and password-reset emails</li>
            </ul>

            <p>We do not intentionally provide these services with more information than is necessary for the relevant functionality, although each provider may independently process technical information as part of operating its service.</p>

            <h2>Data storage and retention</h2>

            <p>Information stored in the Eldritch Tools database is retained while it is needed to operate the relevant account or feature.</p>

            <p>User-created database records associated with an account are deleted when the account is deleted, subject to any information that may need to be retained for security or legal reasons.</p>

            <p>Uploaded files are stored separately from the database. As described above, files stored in Cloudflare R2 are not currently automatically removed when their associated database records or accounts are deleted, so orphaned files may remain in storage.</p>

            <p>Realtime room state and messages are not stored in the Eldritch Tools database and are generally discarded when the relevant in-memory state is removed.</p>

            <h2>Account and data deletion</h2>

            <p>Eldritch Tools does not currently provide a self-service account deletion option through the website.</p>

            <p>You may request assistance with deleting your account and associated data by contacting us.</p>

            <p>You may also be able to remove or disconnect your Eldritch Tools account through the authentication provider you used to sign in, where that provider offers functionality for managing or removing connected applications. Disconnecting an authentication provider does not necessarily mean that your Eldritch Tools account or its associated data has been deleted.</p>

            <p>When an Eldritch Tools account is deleted, the account and associated user data stored in the Eldritch Tools database are deleted, including user-created records associated with that account.</p>

            <p>Uploaded images stored separately in Cloudflare R2 may remain after account deletion and are not currently guaranteed to be automatically removed.</p>

            <h2>Data sharing</h2>

            <p>We do not sell personal data.</p>

            <p>Information may be provided to the third-party services described in this policy when necessary to operate the website and its features.</p>

            <p>Content that you choose to publish publicly, such as comments, reviews, or published community content, is naturally visible to other visitors to the website.</p>

            <h2>Security</h2>

            <p>We take reasonable measures to protect the information stored by Eldritch Tools and to prevent unauthorized access. However, no website or internet service can guarantee that information will always remain completely secure.</p>

            <h2>Your rights</h2>

            <p>You may contact us to request access to, correction of, or deletion of personal information associated with your account.</p>

            <h2>Changes to this policy</h2>

            <p>This Privacy Policy may be updated when the website, its features, or its data practices change. The effective date at the top of this page indicates when the current version took effect.</p>

            <h2>Contact</h2>

            <p>For questions or requests concerning this Privacy Policy, contact us at <a className="text-link" href="mailto:contact@eldritchtools.com">contact@eldritchtools.com</a>.</p>

            <p>Eldritch Tools is a fan-made project and is not affiliated with or endorsed by Project Moon. Limbus Company and related intellectual property and assets belong to Project Moon and their respective owners. Eldritch Tools does not claim ownership of that intellectual property.</p>
        </main>
    );
}
