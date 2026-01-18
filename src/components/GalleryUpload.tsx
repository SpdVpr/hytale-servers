'use client';

import { useState, useRef } from 'react';
import { Images, X, Plus, Loader2 } from 'lucide-react';
import styles from './GalleryUpload.module.css';

interface GalleryUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    label?: string;
    hint?: string;
}

export default function GalleryUpload({
    images,
    onImagesChange,
    maxImages = 6,
    label = 'Gallery Images',
    hint = 'Add up to 6 images to showcase your server'
}: GalleryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);
        setError('');

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        const newImages: string[] = [];

        for (const file of filesToUpload) {
            // Validate file
            if (!file.type.startsWith('image/')) {
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image must be under 5MB');
                continue;
            }

            try {
                // Convert to base64 data URL for now
                // In production, you'd upload to Firebase Storage
                const dataUrl = await fileToDataUrl(file);
                newImages.push(dataUrl);
            } catch (err) {
                console.error('Error processing image:', err);
            }
        }

        if (newImages.length > 0) {
            onImagesChange([...images, ...newImages]);
        }

        setUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>
                <Images size={16} />
                {label}
            </label>
            <p className={styles.hint}>{hint}</p>

            <div className={styles.gallery}>
                {images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                        <img src={image} alt={`Gallery ${index + 1}`} />
                        <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => removeImage(index)}
                            title="Remove image"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <Loader2 className={styles.spinner} size={24} />
                        ) : (
                            <>
                                <Plus size={24} />
                                <span>Add Image</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className={styles.fileInput}
            />

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.count}>
                {images.length}/{maxImages} images
            </p>
        </div>
    );
}
