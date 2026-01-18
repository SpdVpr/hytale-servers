import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, Wifi, Server, Home, ChevronRight, Gamepad2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'How to Join a Hytale Server - Complete Guide 2026',
    description: 'Step-by-step guide to joining Hytale multiplayer servers. Learn how to connect to servers, add server addresses, troubleshoot connection issues, and find the best Hytale servers.',
    keywords: ['how to join hytale server', 'hytale server guide', 'connect to hytale server', 'hytale multiplayer guide', 'hytale server ip'],
    openGraph: {
        title: 'How to Join a Hytale Server - Complete Guide 2026',
        description: 'Step-by-step guide to joining Hytale multiplayer servers.',
        url: 'https://www.hytaletop.fun/how-to-join',
    },
    alternates: {
        canonical: 'https://www.hytaletop.fun/how-to-join',
    },
};

export default function HowToJoinPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': 'How to Join a Hytale Server',
        'description': 'Complete guide to joining Hytale multiplayer servers in 2026.',
        'totalTime': 'PT5M',
        'step': [
            { '@type': 'HowToStep', 'position': 1, 'name': 'Launch Hytale', 'text': 'Open the Hytale game on your computer.' },
            { '@type': 'HowToStep', 'position': 2, 'name': 'Open Multiplayer Menu', 'text': 'From the main menu, click on the Multiplayer option.' },
            { '@type': 'HowToStep', 'position': 3, 'name': 'Add Server', 'text': 'Click "Add Server" or "Direct Connect".' },
            { '@type': 'HowToStep', 'position': 4, 'name': 'Enter Server Address', 'text': 'Paste the server IP address (e.g., play.example.com or 123.45.67.89:5520).' },
            { '@type': 'HowToStep', 'position': 5, 'name': 'Connect', 'text': 'Click Connect and wait for the server to load.' },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className={styles.page}>
                <div className="container">
                    <nav className={styles.breadcrumb}>
                        <Link href="/"><Home size={14} /> Home</Link>
                        <ChevronRight size={14} />
                        <span>How to Join</span>
                    </nav>

                    <header className={styles.hero}>
                        <div className={styles.heroBadge}><Gamepad2 size={16} /> Complete Guide</div>
                        <h1>How to Join a <span className={styles.highlight}>Hytale Server</span></h1>
                        <p>Follow this simple step-by-step guide to connect to any Hytale multiplayer server. Takes less than 5 minutes!</p>
                    </header>

                    <section className={styles.requirements}>
                        <h2>What You Need</h2>
                        <div className={styles.requirementsGrid}>
                            <div className={styles.requirementCard}>
                                <Download size={24} />
                                <h3>Hytale Installed</h3>
                                <p>Download from <a href="https://hytale.com" target="_blank" rel="noopener noreferrer">hytale.com</a></p>
                            </div>
                            <div className={styles.requirementCard}>
                                <Wifi size={24} />
                                <h3>Internet Connection</h3>
                                <p>Stable connection for smooth gameplay</p>
                            </div>
                            <div className={styles.requirementCard}>
                                <Server size={24} />
                                <h3>Server IP Address</h3>
                                <p>Find one from our <Link href="/servers">server list</Link></p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.stepsSection}>
                        <h2>Step-by-Step Guide</h2>
                        <div className={styles.stepsList}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <div className={styles.stepContent}>
                                    <h3>Launch Hytale</h3>
                                    <p>Open the Hytale game on your computer. Make sure you're logged into your Hytale account.</p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <div className={styles.stepContent}>
                                    <h3>Open Multiplayer Menu</h3>
                                    <p>From the main menu, click on the <strong>"Multiplayer"</strong> button.</p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <div className={styles.stepContent}>
                                    <h3>Add Server or Direct Connect</h3>
                                    <p><strong>Add Server</strong> – Saves the server to your list. <strong>Direct Connect</strong> – Connect once without saving.</p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>4</div>
                                <div className={styles.stepContent}>
                                    <h3>Enter the Server Address</h3>
                                    <p>Paste or type the server's IP address:</p>
                                    <div className={styles.codeBlock}>
                                        <code>play.servername.com</code> or <code>123.45.67.89:5520</code>
                                    </div>
                                    <p className={styles.note}><AlertCircle size={14} /> Default Hytale port is <strong>5520</strong></p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>5</div>
                                <div className={styles.stepContent}>
                                    <h3>Connect and Play!</h3>
                                    <p>Click <strong>"Connect"</strong> and wait for the server to load.</p>
                                    <div className={styles.successBox}><CheckCircle size={20} /> You're now playing on a Hytale multiplayer server!</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.ctaSection}>
                        <h2>Ready to Play?</h2>
                        <p>Browse our curated list of the best Hytale servers.</p>
                        <div className={styles.ctaButtons}>
                            <Link href="/servers" className="btn btn-primary btn-lg">Browse Servers <ArrowRight size={18} /></Link>
                            <Link href="/top" className="btn btn-ghost btn-lg">View Top 100</Link>
                        </div>
                    </section>

                    <section className={styles.faqSection}>
                        <h2>Frequently Asked Questions</h2>
                        <details className={styles.faqItem}>
                            <summary>Is it free to join Hytale servers?</summary>
                            <p>Yes! Joining any Hytale server is completely free. Some servers may have optional premium features.</p>
                        </details>
                        <details className={styles.faqItem}>
                            <summary>What is the default Hytale server port?</summary>
                            <p>The default port is <strong>5520</strong>. If no port is specified, the game uses this automatically.</p>
                        </details>
                        <details className={styles.faqItem}>
                            <summary>How do I find the best server for me?</summary>
                            <p>Use our <Link href="/servers">server browser</Link> to filter by category, read reviews, and use the ping test.</p>
                        </details>
                    </section>
                </div>
            </div>
        </>
    );
}
