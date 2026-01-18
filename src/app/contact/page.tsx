import { Metadata } from 'next';
import { Mail, MessageSquare, Globe } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the HytaleTop team. Report issues, suggest features, or ask questions.',
};

export default function ContactPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you</p>
                </header>

                <div className={styles.content}>
                    <div className={styles.contactOptions}>
                        <div className={styles.contactCard}>
                            <Mail size={32} />
                            <h2>Email</h2>
                            <p>For general inquiries and support</p>
                            <a href="mailto:contact@hytaletop.fun" className={styles.contactLink}>
                                contact@hytaletop.fun
                            </a>
                        </div>

                        <div className={styles.contactCard}>
                            <MessageSquare size={32} />
                            <h2>Discord</h2>
                            <p>Join our community for quick help</p>
                            <a
                                href="https://discord.gg/hytaletop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.contactLink}
                            >
                                Join Discord
                            </a>
                        </div>

                        <div className={styles.contactCard}>
                            <Globe size={32} />
                            <h2>Social Media</h2>
                            <p>Follow us for updates</p>
                            <a
                                href="https://twitter.com/HytaleTop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.contactLink}
                            >
                                @HytaleTop
                            </a>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <h2>Before You Contact Us</h2>
                        <ul>
                            <li><strong>Server issues:</strong> We don't run individual servers. Contact the server owner directly.</li>
                            <li><strong>Listing problems:</strong> Make sure you're signed in and own the server you want to edit.</li>
                            <li><strong>General questions:</strong> Check our <a href="/faq">FAQ page</a> first.</li>
                        </ul>

                        <h3>What We Can Help With</h3>
                        <ul>
                            <li>Report bugs or technical issues with HytaleTop</li>
                            <li>Suggest new features or improvements</li>
                            <li>Report inappropriate content or servers</li>
                            <li>Partnership and advertising inquiries</li>
                            <li>API access requests</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
