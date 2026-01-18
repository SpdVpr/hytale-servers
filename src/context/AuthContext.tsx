'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// ===================================
// Types
// ===================================

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

// ===================================
// Context
// ===================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===================================
// Provider Component
// ===================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign in with email/password
    const signIn = async (email: string, password: string) => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
            throw err;
        }
    };

    // Sign up with email/password
    const signUp = async (email: string, password: string) => {
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create account';
            setError(message);
            throw err;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(message);
            throw err;
        }
    };

    // Sign out
    const signOut = async () => {
        setError(null);
        try {
            await firebaseSignOut(auth);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
            throw err;
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to send reset email';
            setError(message);
            throw err;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ===================================
// Hook
// ===================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ===================================
// Higher-Order Component for Protected Routes
// ===================================

interface WithAuthProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: WithAuthProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return fallback || (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <p>Please sign in to access this page.</p>
            </div>
        );
    }

    return <>{children}</>;
}
