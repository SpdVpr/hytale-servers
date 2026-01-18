import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const links = {
        servers: [
            { name: 'Browse Servers', href: '/servers' },
            { name: 'Top 100', href: '/top' },
            { name: 'Add Server', href: '/submit' },
            { name: 'Random Server', href: '/random' },
        ],
        categories: [
            { name: 'Survival', href: '/category/survival' },
            { name: 'PvP', href: '/category/pvp' },
            { name: 'Minigames', href: '/category/minigames' },
            { name: 'Creative', href: '/category/creative' },
            { name: 'Roleplay', href: '/category/roleplay' },
            { name: 'Adventure', href: '/category/adventure' },
        ],
        resources: [
            { name: 'How to Join', href: '/how-to-join' },
            { name: 'About Us', href: '/about' },
            { name: 'FAQ', href: '/faq' },
            { name: 'API', href: '/api-docs' },
            { name: 'Contact', href: '/contact' },
        ],
        legal: [
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Privacy Policy', href: '/privacy' },
        ],
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Main Footer */}
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <img
                                src="/logo-server-final.png"
                                alt="HytaleTop.fun"
                                className={styles.logoImage}
                                width={180}
                                height={45}
                                loading="lazy"
                            />
                        </Link>
                        <p className={styles.brandDescription}>
                            The ultimate Hytale server discovery platform. Real-time ping tests,
                            community reviews, and instant server comparison.
                        </p>
                    </div>

                    {/* Links */}
                    <div className={styles.linksSection}>
                        <h4 className={styles.linkTitle}>Servers</h4>
                        <ul className={styles.linkList}>
                            {links.servers.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={styles.link}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linkTitle}>Categories</h4>
                        <ul className={styles.linkList}>
                            {links.categories.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={styles.link}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linkTitle}>Resources</h4>
                        <ul className={styles.linkList}>
                            {links.resources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={styles.link}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} HytaleTop.fun. All rights reserved.
                    </p>
                    <p className={styles.disclaimer}>
                        Not affiliated with Hypixel Studios or Riot Games.
                    </p>
                    <div className={styles.legalLinks}>
                        {links.legal.map((link) => (
                            <Link key={link.href} href={link.href} className={styles.legalLink}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
