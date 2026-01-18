'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Camera, Save, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import styles from './page.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, signInWithGoogle } = useAuth();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Update displayName when user loads
    useState(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    });

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Firebase Storage (simplified - using data URL)
        // In production, you'd upload to Firebase Storage and get a URL
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            await updateProfile(user, {
                displayName: displayName,
                // photoURL would be updated after uploading to Firebase Storage
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loginPrompt}>
                        <div className={`glass-card ${styles.loginCard}`}>
                            <User size={48} className={styles.loginIcon} />
                            <h1>Sign In Required</h1>
                            <p>You need to sign in to view your profile.</p>
                            <button
                                onClick={signInWithGoogle}
                                className={`btn btn-accent btn-lg ${styles.googleLoginButton}`}
                            >
                                <LogIn size={20} />
                                Sign In with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} />
                    Back
                </Link>

                <div className={styles.profileCard}>
                    <div className={`glass-card ${styles.card}`}>
                        <h1 className={styles.title}>Your Profile</h1>

                        {/* Avatar Section */}
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                {photoPreview || user.photoURL ? (
                                    <img
                                        src={photoPreview || user.photoURL || ''}
                                        alt="Profile"
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <User size={48} />
                                    </div>
                                )}
                                <button
                                    className={styles.avatarButton}
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Change photo"
                                >
                                    <Camera size={18} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className={styles.fileInput}
                                />
                            </div>
                            <p className={styles.avatarHint}>
                                Profile photo is synced from your Google account
                            </p>
                        </div>

                        {/* Form */}
                        <div className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="displayName">Display Name</label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    className="input"
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className={`input ${styles.disabledInput}`}
                                />
                                <span className={styles.hint}>Email cannot be changed</span>
                            </div>

                            <div className={styles.field}>
                                <label>Account ID</label>
                                <input
                                    type="text"
                                    value={user.uid}
                                    disabled
                                    className={`input ${styles.disabledInput}`}
                                />
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>Profile updated successfully!</div>}

                        <div className={styles.actions}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn btn-primary btn-lg"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className={styles.spinner} size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
