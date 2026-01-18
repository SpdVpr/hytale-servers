import { Metadata } from 'next';
import { Code, Key, Zap, Lock } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'API Documentation',
    description: 'HytaleTop API documentation for developers. Access server data, statistics, and more.',
};

export default function ApiDocsPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1>API Documentation</h1>
                    <p>Access HytaleTop data programmatically</p>
                </header>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <div className={styles.infoCard}>
                            <Lock size={24} />
                            <div>
                                <h3>API Status: Coming Soon</h3>
                                <p>
                                    Our public API is currently in development. We plan to offer access to
                                    server listings, statistics, and voting data.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>Planned Features</h2>
                        <div className={styles.featureGrid}>
                            <div className={styles.featureCard}>
                                <Code size={20} />
                                <h3>RESTful API</h3>
                                <p>Clean, well-documented REST endpoints for easy integration</p>
                            </div>
                            <div className={styles.featureCard}>
                                <Key size={20} />
                                <h3>API Keys</h3>
                                <p>Secure authentication with rate limiting to protect the service</p>
                            </div>
                            <div className={styles.featureCard}>
                                <Zap size={20} />
                                <h3>Real-time Data</h3>
                                <p>Access live server status, player counts, and vote data</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>Planned Endpoints</h2>
                        <div className={styles.endpoints}>
                            <div className={styles.endpoint}>
                                <code className={styles.method}>GET</code>
                                <code className={styles.path}>/api/v1/servers</code>
                                <span>List all servers with filtering and pagination</span>
                            </div>
                            <div className={styles.endpoint}>
                                <code className={styles.method}>GET</code>
                                <code className={styles.path}>/api/v1/servers/:slug</code>
                                <span>Get details for a specific server</span>
                            </div>
                            <div className={styles.endpoint}>
                                <code className={styles.method}>GET</code>
                                <code className={styles.path}>/api/v1/servers/top</code>
                                <span>Get top 100 servers by votes</span>
                            </div>
                            <div className={styles.endpoint}>
                                <code className={styles.method}>GET</code>
                                <code className={styles.path}>/api/v1/stats</code>
                                <span>Get platform-wide statistics</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>Get Notified</h2>
                        <p>
                            Want to be notified when the API launches? Contact us at{' '}
                            <a href="mailto:api@hytaletop.fun">api@hytaletop.fun</a> and we'll let you know
                            when it's ready.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Terms of Use</h2>
                        <ul>
                            <li>API access is provided for legitimate purposes only</li>
                            <li>Rate limiting will be enforced to ensure fair usage</li>
                            <li>Scraping without API access is prohibited</li>
                            <li>Attribution to HytaleTop is required when displaying our data</li>
                            <li>We reserve the right to revoke access for abuse</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
