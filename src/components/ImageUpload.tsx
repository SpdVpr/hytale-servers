'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onError?: (error: string) => void;
    currentImage?: string;
    label?: string;
    hint?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeMB?: number;
    aspectRatio?: number; // width/height, e.g. 16/9 = 1.77
    folder?: string;
}

/**
 * Compress image using canvas
 */
async function compressImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Use high quality interpolation
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob with compression
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                'image/webp', // WebP for best compression
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUpload({
    onUpload,
    onError,
    currentImage,
    label = 'Upload Image',
    hint = 'PNG, JPG or WebP (max 5MB)',
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    maxSizeMB = 5,
    aspectRatio,
    folder = 'images',
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<{
        original: number;
        compressed: number;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            onError?.('Please upload an image file');
            return;
        }

        // Validate file size (before compression)
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes * 2) { // Allow 2x for pre-compression
            onError?.(`File too large. Maximum size is ${maxSizeMB * 2}MB`);
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(10);

            // Compress image
            const originalSize = file.size;
            const compressedBlob = await compressImage(file, maxWidth, maxHeight, quality);
            const compressedSize = compressedBlob.size;

            setCompressionInfo({ original: originalSize, compressed: compressedSize });
            setUploadProgress(40);

            // Check compressed size
            if (compressedSize > maxBytes) {
                onError?.(`Compressed image still too large (${formatFileSize(compressedSize)}). Try a smaller image.`);
                setUploading(false);
                return;
            }

            // Create preview
            const previewUrl = URL.createObjectURL(compressedBlob);
            setPreview(previewUrl);
            setUploadProgress(60);

            // Upload to Firebase Storage
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const { storage } = await import('@/lib/firebase');

            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}.webp`;
            const storageRef = ref(storage, `${folder}/${fileName}`);

            setUploadProgress(70);

            // Upload
            await uploadBytes(storageRef, compressedBlob, {
                contentType: 'image/webp',
            });

            setUploadProgress(90);

            // Get download URL
            const downloadUrl = await getDownloadURL(storageRef);

            setUploadProgress(100);
            onUpload(downloadUrl);

            // Clean up old preview URL
            URL.revokeObjectURL(previewUrl);
            setPreview(downloadUrl);

        } catch (error) {
            console.error('Upload error:', error);
            onError?.('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [folder, maxHeight, maxSizeMB, maxWidth, onError, onUpload, quality]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        setCompressionInfo(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onUpload]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

            <div
                className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${preview ? styles.hasPreview : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={!preview ? handleClick : undefined}
                style={aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className={styles.input}
                />

                {uploading ? (
                    <div className={styles.uploading}>
                        <Loader2 className={styles.spinner} size={32} />
                        <span>Uploading... {uploadProgress}%</span>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : preview ? (
                    <div className={styles.previewContainer}>
                        <img src={preview} alt="Preview" className={styles.preview} />
                        <div className={styles.previewOverlay}>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={handleRemove}
                            >
                                <X size={20} />
                            </button>
                            <button
                                type="button"
                                className={styles.changeBtn}
                                onClick={handleClick}
                            >
                                Change Image
                            </button>
                        </div>
                        {compressionInfo && (
                            <div className={styles.compressionBadge}>
                                <Check size={14} />
                                {formatFileSize(compressionInfo.original)} → {formatFileSize(compressionInfo.compressed)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <div className={styles.iconWrapper}>
                            <ImageIcon size={32} />
                            <Upload size={20} className={styles.uploadIcon} />
                        </div>
                        <span className={styles.placeholderText}>
                            Drop an image here or click to browse
                        </span>
                        <span className={styles.hint}>{hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
