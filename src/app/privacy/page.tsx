import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for HytaleTop.fun - how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <article className={styles.article}>
                    <header className={styles.header}>
                        <h1>Privacy Policy</h1>
                        <p className={styles.lastUpdated}>Last updated: January 17, 2026</p>
                    </header>

                    <section className={styles.section}>
                        <h2>1. Introduction</h2>
                        <p>
                            This Privacy Policy explains how HytaleTop.fun ("we", "our", "us") collects, uses,
                            and protects your personal information when you use our website and services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Information We Collect</h2>

                        <h3>2.1 Information You Provide</h3>
                        <ul>
                            <li><strong>Account Information:</strong> When you sign in with Google, we receive your name, email address, and profile picture.</li>
                            <li><strong>Server Listings:</strong> Information you provide when listing a server (name, description, IP, etc.)</li>
                            <li><strong>Reviews:</strong> Content you submit when reviewing servers</li>
                        </ul>

                        <h3>2.2 Information Collected Automatically</h3>
                        <ul>
                            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on site</li>
                            <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                            <li><strong>IP Address:</strong> For security and analytics purposes</li>
                            <li><strong>Cookies:</strong> For authentication and preferences</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. How We Use Your Information</h2>
                        <p>We use collected information to:</p>
                        <ul>
                            <li>Provide and maintain our services</li>
                            <li>Authenticate users and manage accounts</li>
                            <li>Display server listings and reviews</li>
                            <li>Process votes and maintain rankings</li>
                            <li>Improve our website and user experience</li>
                            <li>Prevent fraud and abuse</li>
                            <li>Communicate important updates</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Information Sharing</h2>
                        <p>We do not sell your personal information. We may share information with:</p>
                        <ul>
                            <li><strong>Service Providers:</strong> Third parties that help us operate (hosting, analytics)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Public Information:</strong> Server listings and reviews are publicly visible</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Third-Party Services</h2>
                        <p>We use the following third-party services:</p>
                        <ul>
                            <li><strong>Google Sign-In:</strong> For authentication (subject to Google's privacy policy)</li>
                            <li><strong>Firebase:</strong> For data storage and authentication</li>
                            <li><strong>Google Analytics:</strong> For website analytics</li>
                            <li><strong>Vercel:</strong> For hosting</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Cookies</h2>
                        <p>We use cookies for:</p>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                            <li><strong>Analytics Cookies:</strong> To understand how visitors use our site</li>
                            <li><strong>Preference Cookies:</strong> To remember your settings</li>
                        </ul>
                        <p>You can control cookies through your browser settings.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your data. However, no
                            method of transmission over the Internet is 100% secure, and we cannot
                            guarantee absolute security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your account and data</li>
                            <li>Export your data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                        <p>Contact us to exercise these rights.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Children's Privacy</h2>
                        <p>
                            Our Service is not intended for children under 13. We do not knowingly collect
                            personal information from children under 13. If you believe we have collected
                            such information, please contact us.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. We will notify you of significant
                            changes by posting an announcement on our website. Continued use after changes
                            constitutes acceptance.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact Us</h2>
                        <p>
                            For privacy-related questions, contact us at{' '}
                            <a href="mailto:privacy@hytaletop.fun">privacy@hytaletop.fun</a>.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
