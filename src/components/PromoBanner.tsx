'use client';

import Link from 'next/link';
import { Plus, TrendingUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user has dismissed the banner
        const dismissed = localStorage.getItem('promoBannerDismissed');
        if (dismissed) {
            setIsDismissed(true);
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('promoBannerDismissed', 'true');
    };

    if (isDismissed || !isVisible) return null;

    return (
        <div className={styles.promoBanner}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.icon}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.text}>
                        <span className={styles.message}>
                            <strong>Got your own server?</strong> Add it to our list and get votes! 🎮
                        </span>
                    </div>
                    <Link href="/submit" className={styles.ctaButton}>
                        <Plus size={18} />
                        Add Server
                    </Link>
                </div>
                <button
                    onClick={handleDismiss}
                    className={styles.closeButton}
                    aria-label="Close banner"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
