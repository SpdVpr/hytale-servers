// ===================================
// CURSEFORGE API - Complete Integration
// ===================================

const CURSEFORGE_BASE_URL = 'https://api.curseforge.com';

// Game IDs - will be dynamically discovered
let HYTALE_GAME_ID: number | null = null;

// ===================================
// Types from CurseForge API
// ===================================

export interface CurseForgeGame {
    id: number;
    name: string;
    slug: string;
    dateModified: string;
    assets: {
        iconUrl: string;
        tileUrl: string;
        coverUrl: string;
    };
    status: number;
    apiStatus: number;
}

export interface CurseForgeCategory {
    id: number;
    gameId: number;
    name: string;
    slug: string;
    url: string;
    iconUrl: string;
    dateModified: string;
    isClass: boolean;
    classId: number;
    parentCategoryId: number;
    displayIndex: number;
}

export interface CurseForgeModAuthor {
    id: number;
    name: string;
    url: string;
}

export interface CurseForgeModAsset {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
}

export interface CurseForgeModLinks {
    websiteUrl: string;
    wikiUrl: string;
    issuesUrl: string;
    sourceUrl: string;
}

export interface CurseForgeFileDependency {
    modId: number;
    relationType: number; // 1=EmbeddedLibrary, 2=OptionalDependency, 3=RequiredDependency, 4=Tool, 5=Incompatible, 6=Include
}

export interface CurseForgeFile {
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number; // 1=Release, 2=Beta, 3=Alpha
    fileStatus: number;
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    downloadUrl: string | null;
    gameVersions: string[];
    dependencies: CurseForgeFileDependency[];
    isServerPack: boolean;
    serverPackFileId: number | null;
}

export interface CurseForgeMod {
    id: number;
    gameId: number;
    name: string;
    slug: string;
    links: CurseForgeModLinks;
    summary: string;
    status: number;
    downloadCount: number;
    isFeatured: boolean;
    primaryCategoryId: number;
    categories: CurseForgeCategory[];
    classId: number;
    authors: CurseForgeModAuthor[];
    logo: CurseForgeModAsset | null;
    screenshots: CurseForgeModAsset[];
    mainFileId: number;
    latestFiles: CurseForgeFile[];
    dateCreated: string;
    dateModified: string;
    dateReleased: string;
    allowModDistribution: boolean;
    gamePopularityRank: number;
    isAvailable: boolean;
    thumbsUpCount: number;
    rating: number;
}

export interface CurseForgeSearchResult {
    data: CurseForgeMod[];
    pagination: {
        index: number;
        pageSize: number;
        resultCount: number;
        totalCount: number;
    };
}

export interface CurseForgeFeaturedMods {
    featured: CurseForgeMod[];
    popular: CurseForgeMod[];
    recentlyUpdated: CurseForgeMod[];
}

// ===================================
// Simplified types for our app
// ===================================

export interface ModReference {
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

// ===================================
// API Fetch Helper
// ===================================

async function curseforgeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const apiKey = process.env.CURSEFORGE_API_KEY;

    if (!apiKey) {
        throw new Error('CurseForge API key not configured');
    }

    const url = `${CURSEFORGE_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CurseForge API error ${response.status}: ${errorText}`);
    }

    return response.json();
}

// ===================================
// Core API Functions
// ===================================

/**
 * Get all available games from CurseForge
 */
export async function getGames(): Promise<CurseForgeGame[]> {
    const result = await curseforgeRequest<{ data: CurseForgeGame[] }>('/v1/games');
    return result.data;
}

/**
 * Find and cache Hytale's game ID
 */
export async function getHytaleGameId(): Promise<number> {
    if (HYTALE_GAME_ID !== null) {
        return HYTALE_GAME_ID;
    }

    const games = await getGames();
    const hytale = games.find(
        g => g.name.toLowerCase() === 'hytale' || g.slug.toLowerCase() === 'hytale'
    );

    if (!hytale) {
        // If Hytale isn't found, fall back to a search approach or default
        // For now, we'll check common game IDs or use Minecraft as fallback for testing
        console.warn('Hytale not found in CurseForge games list. Available games:', games.map(g => g.name));
        throw new Error('Hytale game not found in CurseForge');
    }

    HYTALE_GAME_ID = hytale.id;
    return HYTALE_GAME_ID;
}

/**
 * Get categories for Hytale
 */
export async function getHytaleCategories(): Promise<CurseForgeCategory[]> {
    const gameId = await getHytaleGameId();
    const result = await curseforgeRequest<{ data: CurseForgeCategory[] }>(
        `/v1/categories?gameId=${gameId}`
    );
    return result.data;
}

/**
 * Search for mods - MAIN FUNCTION for autocomplete
 */
export async function searchMods(params: {
    gameId?: number;
    searchFilter?: string;
    classId?: number;
    categoryId?: number;
    categoryIds?: number[];
    gameVersions?: string[];
    sortField?: 'Featured' | 'Popularity' | 'LastUpdated' | 'Name' | 'Author' | 'TotalDownloads' | 'Category' | 'GameVersion' | 'EarlyAccess' | 'FeaturedReleased' | 'ReleasedDate' | 'Rating';
    sortOrder?: 'asc' | 'desc';
    index?: number;
    pageSize?: number;
}): Promise<CurseForgeSearchResult> {
    const queryParams = new URLSearchParams();

    // If no gameId provided, try to get Hytale's
    const gameId = params.gameId ?? await getHytaleGameId().catch(() => null);
    if (gameId) {
        queryParams.set('gameId', gameId.toString());
    }

    if (params.searchFilter) {
        queryParams.set('searchFilter', params.searchFilter);
    }
    if (params.classId) {
        queryParams.set('classId', params.classId.toString());
    }
    if (params.categoryId) {
        queryParams.set('categoryId', params.categoryId.toString());
    }
    if (params.categoryIds?.length) {
        queryParams.set('categoryIds', JSON.stringify(params.categoryIds));
    }
    if (params.gameVersions?.length) {
        queryParams.set('gameVersions', JSON.stringify(params.gameVersions));
    }
    if (params.sortField) {
        queryParams.set('sortField', params.sortField);
    }
    if (params.sortOrder) {
        queryParams.set('sortOrder', params.sortOrder);
    }
    if (params.index !== undefined) {
        queryParams.set('index', params.index.toString());
    }
    if (params.pageSize !== undefined) {
        queryParams.set('pageSize', Math.min(params.pageSize, 50).toString());
    }

    return curseforgeRequest<CurseForgeSearchResult>(`/v1/mods/search?${queryParams.toString()}`);
}

/**
 * Get a single mod by ID
 */
export async function getMod(modId: number): Promise<CurseForgeMod> {
    const result = await curseforgeRequest<{ data: CurseForgeMod }>(`/v1/mods/${modId}`);
    return result.data;
}

/**
 * Get multiple mods by IDs
 */
export async function getMods(modIds: number[]): Promise<CurseForgeMod[]> {
    if (modIds.length === 0) return [];

    const result = await curseforgeRequest<{ data: CurseForgeMod[] }>('/v1/mods', {
        method: 'POST',
        body: JSON.stringify({ modIds }),
    });
    return result.data;
}

/**
 * Get mod description (HTML)
 */
export async function getModDescription(modId: number): Promise<string> {
    const result = await curseforgeRequest<{ data: string }>(`/v1/mods/${modId}/description`);
    return result.data;
}

/**
 * Get featured mods
 */
export async function getFeaturedMods(gameId?: number): Promise<CurseForgeFeaturedMods> {
    const gId = gameId ?? await getHytaleGameId().catch(() => null);

    const result = await curseforgeRequest<{ data: CurseForgeFeaturedMods }>('/v1/mods/featured', {
        method: 'POST',
        body: JSON.stringify({
            gameId: gId,
            excludedModIds: [],
        }),
    });
    return result.data;
}

/**
 * Get mod files
 */
export async function getModFiles(modId: number, params?: {
    gameVersion?: string;
    modLoaderType?: number;
    index?: number;
    pageSize?: number;
}): Promise<CurseForgeFile[]> {
    const queryParams = new URLSearchParams();

    if (params?.gameVersion) {
        queryParams.set('gameVersion', params.gameVersion);
    }
    if (params?.modLoaderType !== undefined) {
        queryParams.set('modLoaderType', params.modLoaderType.toString());
    }
    if (params?.index !== undefined) {
        queryParams.set('index', params.index.toString());
    }
    if (params?.pageSize !== undefined) {
        queryParams.set('pageSize', Math.min(params.pageSize, 50).toString());
    }

    const result = await curseforgeRequest<{ data: CurseForgeFile[] }>(
        `/v1/mods/${modId}/files?${queryParams.toString()}`
    );
    return result.data;
}

/**
 * Get download URL for a specific file
 */
export async function getModFileDownloadUrl(modId: number, fileId: number): Promise<string> {
    const result = await curseforgeRequest<{ data: string }>(
        `/v1/mods/${modId}/files/${fileId}/download-url`
    );
    return result.data;
}

// ===================================
// Helper Functions for our App
// ===================================

/**
 * Convert CurseForgeMod to simplified ModReference
 */
export function modToReference(mod: CurseForgeMod): ModReference {
    const latestFile = mod.latestFiles?.[0];

    return {
        id: mod.id,
        name: mod.name,
        slug: mod.slug,
        summary: mod.summary,
        thumbnailUrl: mod.logo?.thumbnailUrl ?? null,
        downloadCount: mod.downloadCount,
        rating: mod.rating,
        authors: mod.authors.map(a => a.name),
        categories: mod.categories.map(c => c.name),
        websiteUrl: mod.links?.websiteUrl ?? null,
        latestVersion: latestFile?.displayName,
        isServerPack: latestFile?.isServerPack,
    };
}

/**
 * Search mods and return simplified references (for autocomplete)
 */
export async function searchModsSimple(
    query: string,
    limit: number = 10
): Promise<ModReference[]> {
    const result = await searchMods({
        searchFilter: query,
        pageSize: limit,
        sortField: 'Popularity',
        sortOrder: 'desc',
    });

    return result.data.map(modToReference);
}

/**
 * Get popular/featured mods for display
 */
export async function getPopularMods(limit: number = 20): Promise<ModReference[]> {
    const result = await searchMods({
        pageSize: limit,
        sortField: 'Popularity',
        sortOrder: 'desc',
    });

    return result.data.map(modToReference);
}

/**
 * Get recently updated mods
 */
export async function getRecentMods(limit: number = 20): Promise<ModReference[]> {
    const result = await searchMods({
        pageSize: limit,
        sortField: 'LastUpdated',
        sortOrder: 'desc',
    });

    return result.data.map(modToReference);
}

/**
 * Get mods by category
 */
export async function getModsByCategory(
    categoryId: number,
    limit: number = 20
): Promise<ModReference[]> {
    const result = await searchMods({
        categoryId,
        pageSize: limit,
        sortField: 'Popularity',
        sortOrder: 'desc',
    });

    return result.data.map(modToReference);
}

/**
 * Validate that mods exist and return their details
 */
export async function validateMods(modIds: number[]): Promise<ModReference[]> {
    if (modIds.length === 0) return [];

    const mods = await getMods(modIds);
    return mods.map(modToReference);
}

// ===================================
// Export for testing game discovery
// ===================================

export async function discoverGames(): Promise<{ games: CurseForgeGame[]; hytaleId: number | null }> {
    const games = await getGames();
    const hytale = games.find(
        g => g.name.toLowerCase().includes('hytale') || g.slug.toLowerCase().includes('hytale')
    );

    return {
        games,
        hytaleId: hytale?.id ?? null,
    };
}
