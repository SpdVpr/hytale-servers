'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './ModAutocomplete.module.css';

// ===================================
// Types
// ===================================

interface ModReference {
    id: number;
    name: string;
    slug: string;
    summary: string;
    thumbnailUrl: string | null;
    downloadCount: number;
    rating: number;
    authors: string[];
    categories: string[];
    websiteUrl: string | null;
    latestVersion?: string;
    isServerPack?: boolean;
}

interface ModAutocompleteProps {
    selectedMods: ModReference[];
    onModsChange: (mods: ModReference[]) => void;
    maxMods?: number;
    placeholder?: string;
    label?: string;
    helpText?: string;
}

// ===================================
// Utility Functions
// ===================================

function formatDownloads(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

function debounce<T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ===================================
// Component
// ===================================

export default function ModAutocomplete({
    selectedMods,
    onModsChange,
    maxMods = 20,
    placeholder = 'Vyhledat mod...',
    label = 'Mody na serveru',
    helpText = 'Přidejte mody, které server používá. Hráči tak snáze najdou server s mody, které hledají.',
}: ModAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<ModReference[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search function
    const searchMods = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/curseforge/search?q=${encodeURIComponent(searchQuery)}&limit=10`
                );
                const data = await response.json();

                if (data.success) {
                    // Filter out already selected mods
                    const selectedIds = new Set(selectedMods.map(m => m.id));
                    const filtered = data.mods.filter((mod: ModReference) => !selectedIds.has(mod.id));
                    setSuggestions(filtered);
                } else {
                    setError(data.error || 'Nepodařilo se vyhledat mody');
                    setSuggestions([]);
                }
            } catch (err) {
                console.error('Mod search error:', err);
                setError('Chyba při vyhledávání');
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        [selectedMods]
    );

    // Handle query changes
    useEffect(() => {
        if (query.trim()) {
            searchMods(query);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query, searchMods]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    addMod(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    // Add a mod to selection
    const addMod = (mod: ModReference) => {
        if (selectedMods.length >= maxMods) {
            setError(`Maximum ${maxMods} modů`);
            return;
        }

        if (selectedMods.some(m => m.id === mod.id)) {
            return; // Already selected
        }

        onModsChange([...selectedMods, mod]);
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    // Remove a mod from selection
    const removeMod = (modId: number) => {
        onModsChange(selectedMods.filter(m => m.id !== modId));
    };

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}

            {/* Selected Mods */}
            {selectedMods.length > 0 && (
                <div className={styles.selectedMods}>
                    {selectedMods.map(mod => (
                        <div key={mod.id} className={styles.modChip}>
                            {mod.thumbnailUrl && (
                                <Image
                                    src={mod.thumbnailUrl}
                                    alt={mod.name}
                                    width={20}
                                    height={20}
                                    className={styles.chipIcon}
                                />
                            )}
                            <span className={styles.chipName}>{mod.name}</span>
                            <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => removeMod(mod.id)}
                                aria-label={`Odebrat ${mod.name}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className={styles.inputWrapper}>
                <div className={styles.searchIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={selectedMods.length >= maxMods}
                />

                {isLoading && (
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner} />
                    </div>
                )}
            </div>

            {/* CurseForge Badge */}
            <div className={styles.poweredBy}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Powered by CurseForge
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (suggestions.length > 0 || isLoading || error) && (
                <div ref={dropdownRef} className={styles.dropdown}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {suggestions.map((mod, index) => (
                        <button
                            key={mod.id}
                            type="button"
                            className={`${styles.suggestion} ${index === highlightedIndex ? styles.highlighted : ''}`}
                            onClick={() => addMod(mod)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <div className={styles.modThumbnail}>
                                {mod.thumbnailUrl ? (
                                    <Image
                                        src={mod.thumbnailUrl}
                                        alt={mod.name}
                                        width={40}
                                        height={40}
                                        className={styles.modImage}
                                    />
                                ) : (
                                    <div className={styles.modPlaceholder}>📦</div>
                                )}
                            </div>

                            <div className={styles.modInfo}>
                                <div className={styles.modName}>{mod.name}</div>
                                <div className={styles.modMeta}>
                                    <span className={styles.modDownloads}>
                                        ⬇️ {formatDownloads(mod.downloadCount)}
                                    </span>
                                    {mod.authors.length > 0 && (
                                        <span className={styles.modAuthors}>
                                            by {mod.authors.slice(0, 2).join(', ')}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.modSummary}>
                                    {mod.summary.length > 80
                                        ? mod.summary.substring(0, 80) + '...'
                                        : mod.summary
                                    }
                                </div>
                            </div>

                            {mod.isServerPack && (
                                <div className={styles.serverPackBadge}>
                                    Server Pack
                                </div>
                            )}
                        </button>
                    ))}

                    {query.length >= 2 && !isLoading && suggestions.length === 0 && !error && (
                        <div className={styles.noResults}>
                            Žádné mody nenalezeny pro "{query}"
                        </div>
                    )}
                </div>
            )}

            {/* Help Text */}
            {helpText && (
                <p className={styles.helpText}>
                    {helpText}
                    {selectedMods.length > 0 && (
                        <span className={styles.modCount}>
                            {' '}({selectedMods.length}/{maxMods})
                        </span>
                    )}
                </p>
            )}
        </div>
    );
}
