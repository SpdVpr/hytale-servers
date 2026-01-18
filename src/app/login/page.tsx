'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn, Chrome } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin');
        } catch (err) {
            console.error('Login error:', err);
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/admin');
        } catch (err) {
            console.error('Google login error:', err);
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    // Convert Firebase errors to user-friendly messages
    function getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            const code = (error as { code?: string }).code;
            switch (code) {
                case 'auth/invalid-email':
                    return 'Invalid email address.';
                case 'auth/user-disabled':
                    return 'This account has been disabled.';
                case 'auth/user-not-found':
                    return 'No account found with this email.';
                case 'auth/wrong-password':
                    return 'Incorrect password.';
                case 'auth/invalid-credential':
                    return 'Invalid email or password.';
                case 'auth/popup-closed-by-user':
                    return 'Sign-in popup was closed.';
                case 'auth/popup-blocked':
                    return 'Popup was blocked. Please enable popups.';
                case 'auth/cancelled-popup-request':
                    return 'Sign-in cancelled.';
                default:
                    return error.message || 'An error occurred. Please try again.';
            }
        }
        return 'An error occurred. Please try again.';
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={`glass-card ${styles.card}`}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1>Welcome Back</h1>
                        <p>Sign in to manage your servers</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.forgotPassword}>
                            <Link href="/login/reset">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary ${styles.submitButton}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span>or continue with</span>
                    </div>

                    {/* Social Login */}
                    <button
                        className={styles.googleButton}
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <Chrome size={18} />
                        Google
                    </button>

                    {/* Sign Up Link */}
                    <p className={styles.signUpLink}>
                        Don&apos;t have an account?{' '}
                        <Link href="/login/register">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
