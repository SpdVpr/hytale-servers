// ===================================
// HYTALE SERVERS - Type Definitions
// ===================================

export interface Server {
  id: string;
  slug?: string;
  name: string;
  ip: string;
  port: number;
  description: string;
  shortDescription: string;

  // Kategorire
  category: ServerCategory;
  tags: string[];

  // Status & Statistiky
  isOnline: boolean;
  currentPlayers: number;
  maxPlayers: number;
  uptime: number; // percentage
  lastPinged: Date;

  // Hlasování
  votes: number;
  votesThisMonth: number;

  // Metadata
  website?: string;
  discord?: string;
  country: string;
  language: string[];
  version: string;

  // Obrázky
  banner?: string;
  gallery?: string[]; // Array of image URLs
  logo?: string;

  // 3D Preview
  worldShareCode?: string;
  previewUrl?: string;

  // Premium features
  isFeatured: boolean;
  isVerified: boolean;
  isPremium: boolean;

  // Reviews
  averageRating?: number;
  totalReviews?: number;

  // Ownership
  ownerId?: string; // Firebase user ID
  ownerEmail?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type ServerCategory =
  | 'survival'
  | 'pvp'
  | 'creative'
  | 'minigames'
  | 'roleplay'
  | 'adventure'
  | 'economy'
  | 'skyblock'
  | 'modded'
  | 'other';

export const CATEGORY_INFO: Record<ServerCategory, { label: string; icon: string; color: string }> = {
  survival: { label: 'Survival', icon: '🌲', color: '#22c55e' },
  pvp: { label: 'PvP', icon: '⚔️', color: '#ef4444' },
  creative: { label: 'Creative', icon: '🎨', color: '#a855f7' },
  minigames: { label: 'Minigames', icon: '🎮', color: '#f97316' },
  roleplay: { label: 'Roleplay', icon: '🎭', color: '#ec4899' },
  adventure: { label: 'Adventure', icon: '🗺️', color: '#0ea5e9' },
  economy: { label: 'Economy', icon: '💰', color: '#eab308' },
  skyblock: { label: 'Skyblock', icon: '🏝️', color: '#06b6d4' },
  modded: { label: 'Modded', icon: '🔧', color: '#8b5cf6' },
  other: { label: 'Other', icon: '🌟', color: '#64748b' },
};

export interface ServerFilters {
  search: string;
  category: ServerCategory | 'all';
  country: string | 'all';
  sortBy: 'votes' | 'players' | 'newest' | 'name';
  onlineOnly: boolean;
}

export interface ServerSubmission {
  name: string;
  ip: string;
  port: number;
  description: string;
  shortDescription: string;
  category: ServerCategory;
  tags: string[];
  website?: string;
  discord?: string;
  country: string;
  language: string[];
  banner?: string;
  gallery?: string[];
  worldShareCode?: string;
  ownerEmail: string;
}

export interface Vote {
  id: string;
  serverId: string;
  visitorId: string; // fingerprint nebo IP hash
  votedAt: Date;
}

export interface ServerStats {
  totalServers: number;
  totalPlayers: number;
  totalVotes: number;
  onlineServers: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServerQueryResult {
  online: boolean;
  players: number;
  maxPlayers: number;
  motd?: string;
  version?: string;
  latency?: number;
}

