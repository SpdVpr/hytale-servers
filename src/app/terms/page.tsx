import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for using HytaleTop.fun - the Hytale servers list platform.',
};

export default function TermsPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <article className={styles.article}>
                    <header className={styles.header}>
                        <h1>Terms of Service</h1>
                        <p className={styles.lastUpdated}>Last updated: January 17, 2026</p>
                    </header>

                    <section className={styles.section}>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using HytaleTop.fun ("the Service"), you agree to be bound by
                            these Terms of Service. If you do not agree to these terms, please do not use
                            our Service.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Description of Service</h2>
                        <p>
                            HytaleTop.fun is a directory platform that helps users discover Hytale multiplayer
                            servers. We provide server listings, voting systems, reviews, and related features.
                        </p>
                        <p>
                            We do not own, operate, or control the individual servers listed on our platform.
                            Server owners are solely responsible for their server's content and operations.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>3. User Accounts</h2>
                        <p>To access certain features, you may need to create an account using Google Sign-In.</p>
                        <ul>
                            <li>You must provide accurate information</li>
                            <li>You are responsible for maintaining account security</li>
                            <li>You must be at least 13 years old to use the Service</li>
                            <li>One account per person; multiple accounts are prohibited</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Server Listings</h2>
                        <p>When listing a server, you agree to:</p>
                        <ul>
                            <li>Only list servers you own or have permission to list</li>
                            <li>Provide accurate server information</li>
                            <li>Not list servers containing illegal content</li>
                            <li>Keep your listing information up to date</li>
                        </ul>
                        <p>
                            We reserve the right to remove any server listing at our discretion, including
                            but not limited to servers that violate these terms or contain inappropriate content.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Voting System</h2>
                        <p>Users may vote for servers once per 24-hour period. The following are prohibited:</p>
                        <ul>
                            <li>Using bots or automated systems to vote</li>
                            <li>Creating multiple accounts to vote</li>
                            <li>Exchanging votes for money or items</li>
                            <li>Any form of vote manipulation</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>6. User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Post false, misleading, or defamatory content</li>
                            <li>Harass, abuse, or threaten other users</li>
                            <li>Attempt to hack or disrupt the Service</li>
                            <li>Scrape data without permission</li>
                            <li>Use the Service for any illegal purpose</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Intellectual Property</h2>
                        <p>
                            All content on HytaleTop.fun, excluding user-submitted content and Hytale-related
                            trademarks, is owned by us. Hytale and related marks are property of Hypixel Studios.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Disclaimer</h2>
                        <p>
                            The Service is provided "as is" without warranties of any kind. We are not
                            responsible for:
                        </p>
                        <ul>
                            <li>Content or conduct of individual servers</li>
                            <li>Server downtime or technical issues</li>
                            <li>Any damages resulting from use of the Service</li>
                            <li>Third-party websites or services linked from our platform</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, HytaleTop.fun shall not be liable for
                            any indirect, incidental, special, consequential, or punitive damages resulting
                            from your use of the Service.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Changes to Terms</h2>
                        <p>
                            We may update these Terms at any time. Continued use of the Service after
                            changes constitutes acceptance of the new Terms. We encourage you to review
                            this page periodically.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact</h2>
                        <p>
                            For questions about these Terms, please contact us at{' '}
                            <a href="mailto:contact@hytaletop.fun">contact@hytaletop.fun</a>.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
