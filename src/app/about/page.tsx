import { Metadata } from 'next';
import Link from 'next/link';
import { Server, Users, Globe, Zap, Shield, Heart } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about Hytale Servers - the #1 server list for finding the best Hytale multiplayer servers.',
};

export default function AboutPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                {/* Hero */}
                <section className={styles.hero}>
                    <h1 className={styles.title}>
                        About <span className="text-gradient">Hytale Servers</span>
                    </h1>
                    <p className={styles.subtitle}>
                        We&apos;re passionate gamers building the ultimate server list for the Hytale community
                    </p>
                </section>

                {/* Mission */}
                <section className={`glass-card ${styles.section}`}>
                    <h2 className={styles.sectionTitle}>Our Mission</h2>
                    <p className={styles.text}>
                        Hytale Servers was created to help players find their perfect multiplayer experience.
                        With Hytale finally released, our goal is to make server discovery as seamless as possible
                        with real-time statistics, 3D world previews, and a trusted community voting system.
                    </p>
                </section>

                {/* Features */}
                <section className={styles.features}>
                    <h2 className={styles.sectionTitle}>What We Offer</h2>
                    <div className={styles.featuresGrid}>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Zap className={styles.featureIcon} size={28} />
                            <h3>Real-Time Stats</h3>
                            <p>Live player counts and server status updated every minute via our monitoring system.</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Globe className={styles.featureIcon} size={28} />
                            <h3>3D World Previews</h3>
                            <p>Explore server worlds in interactive 3D before joining. Coming soon!</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Shield className={styles.featureIcon} size={28} />
                            <h3>Verified Servers</h3>
                            <p>Trusted servers with verified ownership and community reputation.</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Users className={styles.featureIcon} size={28} />
                            <h3>Community Voting</h3>
                            <p>Democratic voting system powered by the community.</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Server className={styles.featureIcon} size={28} />
                            <h3>Free Listings</h3>
                            <p>List your server completely free, no hidden costs.</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Heart className={styles.featureIcon} size={28} />
                            <h3>Community Driven</h3>
                            <p>Built by players for players, with love for the game.</p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className={`glass-card ${styles.section}`}>
                    <h2 className={styles.sectionTitle}>By the Numbers</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>500+</span>
                            <span className={styles.statLabel}>Servers Listed</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>50K+</span>
                            <span className={styles.statLabel}>Monthly Visitors</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>100K+</span>
                            <span className={styles.statLabel}>Votes Cast</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>24/7</span>
                            <span className={styles.statLabel}>Server Monitoring</span>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className={styles.cta}>
                    <h2>Ready to Join the Community?</h2>
                    <div className={styles.ctaButtons}>
                        <Link href="/servers" className="btn btn-primary btn-lg">
                            Browse Servers
                        </Link>
                        <Link href="/submit" className="btn btn-accent btn-lg">
                            Add Your Server
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
