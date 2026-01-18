'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Server, Plus, Trophy, Info, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, signInWithGoogle, signOut, loading } = useAuth();

    const navigation = [
        { name: 'Servers', href: '/servers', icon: Server },
        { name: 'Top 100', href: '/top', icon: Trophy },
        { name: 'Add Server', href: '/submit', icon: Plus },
        { name: 'About', href: '/about', icon: Info },
    ];

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <img
                        src="/logo-server-final2.png"
                        alt="HytaleTop.fun"
                        className={styles.logoImage}
                        width={160}
                        height={40}
                        loading="eager"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.desktopNav}>
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href} className={styles.navLink}>
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Auth & CTA */}
                <div className={styles.actions}>
                    {loading ? (
                        <div className={styles.authLoading}>...</div>
                    ) : user ? (
                        <div className={styles.userMenu}>
                            <Link href="/profile" className={styles.userInfo}>
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className={styles.userAvatar}
                                    />
                                ) : (
                                    <div className={styles.userAvatarPlaceholder}>
                                        <User size={16} />
                                    </div>
                                )}
                                <span className={styles.userName}>
                                    {user.displayName?.split(' ')[0] || 'User'}
                                </span>
                            </Link>
                            <Link href="/my-servers" className={styles.myServersLink}>
                                <Server size={16} />
                                My Servers
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={styles.logoutButton}
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGoogleLogin}
                            className={styles.loginButton}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Login
                        </button>
                    )}
                    <Link href="/submit" className={`btn btn-accent ${styles.ctaButton}`}>
                        <Plus size={18} />
                        Add Server
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.mobileMenuButton}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className={styles.mobileNav}>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={styles.mobileNavLink}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}

                    {/* Mobile Auth */}
                    {user ? (
                        <div className={styles.mobileUserSection}>
                            <div className={styles.mobileUserInfo}>
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className={styles.userAvatar}
                                    />
                                ) : (
                                    <div className={styles.userAvatarPlaceholder}>
                                        <User size={16} />
                                    </div>
                                )}
                                <span>{user.displayName || user.email}</span>
                            </div>
                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className={styles.mobileLogoutButton}
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { handleGoogleLogin(); setMobileMenuOpen(false); }}
                            className={styles.mobileLoginButton}
                        >
                            <LogIn size={18} />
                            Sign In with Google
                        </button>
                    )}

                    <Link
                        href="/submit"
                        className={`btn btn-accent ${styles.mobileCtaButton}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Plus size={18} />
                        Add Your Server
                    </Link>
                </div>
            )}
        </header>
    );
}
