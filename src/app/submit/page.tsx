'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Server, Globe, Tag, FileText, Image, Disc, LogIn, Package } from 'lucide-react';
import { CATEGORY_INFO, ServerCategory, ServerSubmission, ModReference } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import GalleryUpload from '@/components/GalleryUpload';
import ModAutocomplete from '@/components/ModAutocomplete';
import styles from './page.module.css';

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'SE', name: 'Sweden' },
    { code: 'PL', name: 'Poland' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'SK', name: 'Slovakia' },
];

export default function SubmitPage() {
    const router = useRouter();
    const { user, loading: authLoading, signInWithGoogle } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ServerSubmission, string>>>({});

    const [formData, setFormData] = useState<ServerSubmission>({
        name: '',
        ip: '',
        port: 5520,
        description: '',
        shortDescription: '',
        category: 'survival',
        tags: [],
        website: '',
        discord: '',
        country: 'US',
        language: ['en'],
        banner: '',
        gallery: [],
        worldShareCode: '',
        mods: [],
        ownerEmail: '',
    });

    const [tagInput, setTagInput] = useState('');

    const updateField = <K extends keyof ServerSubmission>(
        field: K,
        value: ServerSubmission[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
            updateField('tags', [...formData.tags, tag]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        updateField('tags', formData.tags.filter((t) => t !== tag));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ServerSubmission, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Server name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (!formData.ip.trim()) {
            newErrors.ip = 'IP address is required';
        }

        if (!formData.shortDescription.trim()) {
            newErrors.shortDescription = 'Short description is required';
        } else if (formData.shortDescription.length > 150) {
            newErrors.shortDescription = 'Max 150 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 50) {
            newErrors.description = 'Description must be at least 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            return;
        }

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            // Import Firebase
            const { collection, addDoc, Timestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Create server document
            const serverData = {
                name: formData.name,
                slug: slug,
                ip: formData.ip,
                port: formData.port,
                description: formData.description,
                shortDescription: formData.shortDescription,
                category: formData.category,
                tags: formData.tags,
                banner: formData.banner || null,
                gallery: formData.gallery || [],
                website: formData.website || null,
                discord: formData.discord || null,
                country: formData.country,
                language: formData.language,
                worldShareCode: formData.worldShareCode || null,
                mods: formData.mods || [],
                // Owner info from logged-in user
                ownerId: user.uid,
                ownerEmail: user.email,
                // Default values for new servers
                isOnline: false,
                currentPlayers: 0,
                maxPlayers: 100,
                uptime: 0,
                votes: 0,
                votesThisMonth: 0,
                version: 'Unknown',
                isFeatured: false,
                isVerified: false,
                isPremium: false,
                lastPinged: Timestamp.fromDate(new Date(0)),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            // Add to Firestore
            const docRef = await addDoc(collection(db, 'servers'), serverData);
            console.log('Server added with ID:', docRef.id);

            // Redirect to the new server page
            router.push(`/servers/${slug}?submitted=true`);
        } catch (error) {
            console.error('Error submitting server:', error);
            setErrors({ name: 'Failed to submit. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show login prompt if not authenticated
    if (authLoading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
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
                            <h1>Sign In Required</h1>
                            <p>You need to sign in with Google to add your server.</p>
                            <button
                                onClick={signInWithGoogle}
                                className={`btn btn-accent btn-lg ${styles.googleLoginButton}`}
                            >
                                <LogIn size={20} />
                                Sign In with Google
                            </button>
                            <p className={styles.loginHint}>
                                After signing in, you&apos;ll be able to add and manage your servers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Add Your Server</h1>
                    <p className={styles.subtitle}>
                        List your Hytale server for free and reach thousands of players
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Basic Info Section */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            <Server size={20} />
                            Basic Information
                        </h2>

                        <div className={styles.fieldGrid}>
                            <div className={styles.field}>
                                <label htmlFor="name" className={styles.label}>
                                    Server Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    className={`input ${errors.name ? styles.inputError : ''}`}
                                    placeholder="My Awesome Server"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                />
                                {errors.name && <span className={styles.error}>{errors.name}</span>}
                            </div>

                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label htmlFor="ip" className={styles.label}>
                                        IP Address *
                                    </label>
                                    <input
                                        id="ip"
                                        type="text"
                                        className={`input ${errors.ip ? styles.inputError : ''}`}
                                        placeholder="play.myserver.com"
                                        value={formData.ip}
                                        onChange={(e) => updateField('ip', e.target.value)}
                                    />
                                    {errors.ip && <span className={styles.error}>{errors.ip}</span>}
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="port" className={styles.label}>
                                        Port
                                    </label>
                                    <input
                                        id="port"
                                        type="number"
                                        className="input"
                                        value={formData.port}
                                        onChange={(e) => updateField('port', parseInt(e.target.value) || 25565)}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="category" className={styles.label}>
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    className="select"
                                    value={formData.category}
                                    onChange={(e) => updateField('category', e.target.value as ServerCategory)}
                                >
                                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                                        <option key={key} value={key}>
                                            {info.icon} {info.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Description Section */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            <FileText size={20} />
                            Description
                        </h2>

                        <div className={styles.fieldGrid}>
                            <div className={styles.field}>
                                <label htmlFor="shortDescription" className={styles.label}>
                                    Short Description * (max 150 chars)
                                </label>
                                <input
                                    id="shortDescription"
                                    type="text"
                                    className={`input ${errors.shortDescription ? styles.inputError : ''}`}
                                    placeholder="A brief one-liner about your server"
                                    maxLength={150}
                                    value={formData.shortDescription}
                                    onChange={(e) => updateField('shortDescription', e.target.value)}
                                />
                                <span className={styles.charCount}>
                                    {formData.shortDescription.length}/150
                                </span>
                                {errors.shortDescription && (
                                    <span className={styles.error}>{errors.shortDescription}</span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="description" className={styles.label}>
                                    Full Description * (min 50 chars)
                                </label>
                                <textarea
                                    id="description"
                                    className={`input ${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                                    placeholder="Describe your server in detail. Include features, game modes, community info..."
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />
                                {errors.description && (
                                    <span className={styles.error}>{errors.description}</span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Tags Section */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            <Tag size={20} />
                            Tags
                        </h2>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Tags (max 5)
                            </label>
                            <div className={styles.tagInput}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Type a tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={addTag}
                                    disabled={formData.tags.length >= 5}
                                >
                                    Add
                                </button>
                            </div>
                            <div className={styles.tags}>
                                {formData.tags.map((tag) => (
                                    <span key={tag} className={styles.tag}>
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className={styles.tagRemove}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Links Section */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            <Globe size={20} />
                            Links & Location
                        </h2>

                        <div className={styles.fieldGrid}>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label htmlFor="website" className={styles.label}>
                                        Website
                                    </label>
                                    <input
                                        id="website"
                                        type="url"
                                        className="input"
                                        placeholder="https://myserver.com"
                                        value={formData.website}
                                        onChange={(e) => updateField('website', e.target.value)}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="discord" className={styles.label}>
                                        Discord
                                    </label>
                                    <input
                                        id="discord"
                                        type="url"
                                        className="input"
                                        placeholder="https://discord.gg/xxxxx"
                                        value={formData.discord}
                                        onChange={(e) => updateField('discord', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="country" className={styles.label}>
                                    Server Location
                                </label>
                                <select
                                    id="country"
                                    className="select"
                                    value={formData.country}
                                    onChange={(e) => updateField('country', e.target.value)}
                                >
                                    {COUNTRIES.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Mods Section - CurseForge Integration */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            <Package size={20} />
                            Server Mods
                            <span className={styles.sectionBadge}>CurseForge</span>
                        </h2>

                        <p className={styles.sectionDescription}>
                            Add mods that your server uses. This helps players find servers with their favorite mods.
                        </p>

                        <ModAutocomplete
                            selectedMods={formData.mods || []}
                            onModsChange={(mods) => updateField('mods', mods)}
                            maxMods={20}
                            placeholder="Search for mods..."
                            label=""
                            helpText="Start typing to search CurseForge. Click suggestions to add mods."
                        />
                    </section>

                    {/* Media Section */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            <Image size={20} />
                            Media
                        </h2>

                        <div className={styles.fieldGrid}>
                            <ImageUpload
                                label="Server Banner"
                                hint="Recommended size: 1200x400px (max 5MB)"
                                currentImage={formData.banner}
                                onUpload={(url) => updateField('banner', url)}
                                onError={(error) => setErrors((prev) => ({ ...prev, banner: error }))}
                                folder="servers/banners"
                                maxWidth={1920}
                                maxHeight={600}
                                quality={0.85}
                                aspectRatio={3}
                            />
                            {errors.banner && <span className={styles.error}>{errors.banner}</span>}

                            <GalleryUpload
                                images={formData.gallery || []}
                                onImagesChange={(images) => updateField('gallery', images)}
                                maxImages={6}
                                label="Gallery Images"
                                hint="Add up to 6 images to showcase your server (screenshots, features, etc.)"
                            />

                            <div className={styles.field}>
                                <label htmlFor="worldShareCode" className={styles.label}>
                                    <Disc size={16} />
                                    World Share Code (for 3D Preview)
                                </label>
                                <input
                                    id="worldShareCode"
                                    type="text"
                                    className="input"
                                    placeholder="Paste your Hytale share code here"
                                    value={formData.worldShareCode}
                                    onChange={(e) => updateField('worldShareCode', e.target.value)}
                                />
                                <span className={styles.hint}>
                                    Share codes enable interactive 3D world previews
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Logged In User Info */}
                    <section className={`glass-card ${styles.section}`}>
                        <h2 className={styles.sectionTitle}>
                            Your Account
                        </h2>

                        <div className={styles.userInfoSection}>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    className={styles.userAvatarLarge}
                                />
                            )}
                            <div>
                                <p className={styles.userName}>{user.displayName || 'User'}</p>
                                <p className={styles.userEmail}>{user.email}</p>
                            </div>
                        </div>
                        <p className={styles.hint}>
                            This server will be linked to your account. You&apos;ll be able to edit it anytime.
                        </p>
                    </section>

                    {/* Submit Button */}
                    <div className={styles.submitRow}>
                        <button
                            type="submit"
                            className={`btn btn-accent btn-lg ${styles.submitButton}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className={styles.spinner} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Server
                                </>
                            )}
                        </button>
                        <p className={styles.submitHint}>
                            Your server will be added immediately
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
