'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Trash2, X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Server, ServerCategory, CATEGORY_INFO } from '@/lib/types';
import styles from './ServerOwnerActions.module.css';

interface ServerOwnerActionsProps {
    server: Server;
    onServerUpdated?: (server: Server) => void;
}

export default function ServerOwnerActions({ server, onServerUpdated }: ServerOwnerActionsProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: server.name,
        description: server.description,
        shortDescription: server.shortDescription,
        category: server.category,
        website: server.website || '',
        discord: server.discord || '',
        banner: server.banner || '',
    });

    // Check if current user is the owner
    const isOwner = user && server.ownerId && server.ownerId === user.uid;

    // Debug in development
    if (typeof window !== 'undefined' && user) {
        console.log('ServerOwnerActions Debug:', {
            userId: user.uid,
            serverOwnerId: server.ownerId,
            isOwner,
            serverName: server.name
        });
    }

    if (!isOwner) {
        return null;
    }

    const handleEdit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/servers/${server.slug || server.id}/manage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    updates: editForm,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowEditModal(false);
                onServerUpdated?.({ ...server, ...editForm });
                router.refresh();
            } else {
                setError(data.error || 'Failed to update server');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/servers/${server.slug || server.id}/manage?userId=${user.uid}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (data.success) {
                router.push('/servers');
            } else {
                setError(data.error || 'Failed to delete server');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.ownerActions}>
                <div className={styles.ownerBadge}>
                    <Edit3 size={14} />
                    <span>You own this server</span>
                </div>
                <div className={styles.actionButtons}>
                    <button
                        className={styles.editButton}
                        onClick={() => setShowEditModal(true)}
                    >
                        <Edit3 size={16} />
                        Edit Server
                    </button>
                    <button
                        className={styles.deleteButton}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Server</h2>
                            <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className={styles.form}>
                            <div className={styles.field}>
                                <label>Server Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Short Description</label>
                                <input
                                    type="text"
                                    value={editForm.shortDescription}
                                    onChange={e => setEditForm({ ...editForm, shortDescription: e.target.value })}
                                    maxLength={150}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Full Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    value={editForm.category}
                                    onChange={e => setEditForm({ ...editForm, category: e.target.value as ServerCategory })}
                                >
                                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                                        <option key={key} value={key}>
                                            {info.icon} {info.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label>Website</label>
                                    <input
                                        type="url"
                                        value={editForm.website}
                                        onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Discord</label>
                                    <input
                                        type="url"
                                        value={editForm.discord}
                                        onChange={e => setEditForm({ ...editForm, discord: e.target.value })}
                                        placeholder="https://discord.gg/..."
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Banner URL</label>
                                <input
                                    type="url"
                                    value={editForm.banner}
                                    onChange={e => setEditForm({ ...editForm, banner: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.modalActions}>
                                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
                    <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.deleteIcon}>
                            <Trash2 size={32} />
                        </div>
                        <h2>Delete Server?</h2>
                        <p>Are you sure you want to delete <strong>{server.name}</strong>? This action cannot be undone.</p>

                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.deleteActions}>
                            <button className="btn" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteBtn}
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className={styles.spinner} size={18} /> : <Trash2 size={18} />}
                                Yes, Delete Server
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
