'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Plus, Minus, X, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
    serverId: string;
    serverName: string;
    onSubmit: (data: ReviewData) => Promise<void>;
    onClose: () => void;
}

interface ReviewData {
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    playtime: string;
    userId?: string;
    username?: string;
}

const PLAYTIME_OPTIONS = [
    'Less than 1 hour',
    '1-5 hours',
    '5-20 hours',
    '20-50 hours',
    '50-100 hours',
    '100+ hours',
];

export default function ReviewForm({ serverId, serverName, onSubmit, onClose }: ReviewFormProps) {
    const { user, signInWithGoogle, loading: authLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [pros, setPros] = useState<string[]>(['']);
    const [cons, setCons] = useState<string[]>(['']);
    const [playtime, setPlaytime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Set mounted for portal rendering
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleAddPro = () => {
        if (pros.length < 5) {
            setPros([...pros, '']);
        }
    };

    const handleAddCon = () => {
        if (cons.length < 5) {
            setCons([...cons, '']);
        }
    };

    const handleRemovePro = (index: number) => {
        setPros(pros.filter((_, i) => i !== index));
    };

    const handleRemoveCon = (index: number) => {
        setCons(cons.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) {
            setError('Please sign in to submit a review');
            return;
        }

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!title.trim()) {
            setError('Please enter a review title');
            return;
        }

        if (!content.trim()) {
            setError('Please enter your review');
            return;
        }

        setSubmitting(true);

        try {
            await onSubmit({
                rating,
                title: title.trim(),
                content: content.trim(),
                pros: pros.filter(p => p.trim().length > 0),
                cons: cons.filter(c => c.trim().length > 0),
                playtime,
                userId: user.uid,
                username: user.displayName || 'Anonymous',
            });
            onClose();
        } catch (err) {
            setError('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Don't render until mounted (for portal)
    if (!mounted) return null;

    // Show loading state while checking auth
    if (authLoading) {
        return createPortal(
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Loading...</p>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return createPortal(
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <h2>Sign In Required</h2>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.loginPrompt}>
                        <p>Sign in with Google to write a review for {serverName}</p>
                        <button
                            onClick={signInWithGoogle}
                            className={`btn btn-primary ${styles.googleBtn}`}
                        >
                            <LogIn size={18} />
                            Sign In with Google
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Write a Review</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <p className={styles.subtitle}>Share your experience with {serverName}</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Rating */}
                    <div className={styles.field}>
                        <label>Your Rating *</label>
                        <div className={styles.stars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={styles.starBtn}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        size={32}
                                        className={
                                            star <= (hoverRating || rating)
                                                ? styles.starFilled
                                                : styles.starEmpty
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className={styles.field}>
                        <label>Review Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Summarize your experience"
                            maxLength={100}
                        />
                    </div>

                    {/* Content */}
                    <div className={styles.field}>
                        <label>Your Review *</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="What did you like or dislike about this server?"
                            rows={4}
                            maxLength={2000}
                        />
                        <span className={styles.charCount}>{content.length}/2000</span>
                    </div>

                    {/* Pros & Cons */}
                    <div className={styles.prosConsGrid}>
                        <div className={styles.field}>
                            <label>Pros (optional)</label>
                            {pros.map((pro, idx) => (
                                <div key={idx} className={styles.listItem}>
                                    <input
                                        type="text"
                                        value={pro}
                                        onChange={e => {
                                            const newPros = [...pros];
                                            newPros[idx] = e.target.value;
                                            setPros(newPros);
                                        }}
                                        placeholder="Something positive..."
                                        maxLength={100}
                                    />
                                    {pros.length > 1 && (
                                        <button type="button" onClick={() => handleRemovePro(idx)}>
                                            <Minus size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {pros.length < 5 && (
                                <button type="button" className={styles.addBtn} onClick={handleAddPro}>
                                    <Plus size={16} /> Add Pro
                                </button>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label>Cons (optional)</label>
                            {cons.map((con, idx) => (
                                <div key={idx} className={styles.listItem}>
                                    <input
                                        type="text"
                                        value={con}
                                        onChange={e => {
                                            const newCons = [...cons];
                                            newCons[idx] = e.target.value;
                                            setCons(newCons);
                                        }}
                                        placeholder="Something negative..."
                                        maxLength={100}
                                    />
                                    {cons.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveCon(idx)}>
                                            <Minus size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {cons.length < 5 && (
                                <button type="button" className={styles.addBtn} onClick={handleAddCon}>
                                    <Plus size={16} /> Add Con
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Playtime */}
                    <div className={styles.field}>
                        <label>Your Playtime (optional)</label>
                        <select value={playtime} onChange={e => setPlaytime(e.target.value)}>
                            <option value="">Select playtime...</option>
                            {PLAYTIME_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <button type="button" className="btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
