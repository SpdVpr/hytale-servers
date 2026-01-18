// ===================================
// Discord Integration
// Fetch member counts from Discord servers
// ===================================

interface DiscordWidgetData {
    id: string;
    name: string;
    instant_invite: string | null;
    presence_count: number; // Online members
    members: Array<{
        id: string;
        username: string;
        avatar_url: string;
        status: string;
    }>;
}

interface DiscordServerInfo {
    id: string;
    name?: string;
    onlineMembers: number;
    inviteUrl?: string;
    available: boolean;
}

// Known Discord servers for Hytale communities
export const KNOWN_DISCORD_SERVERS: Record<string, string> = {
    'hytown': '1012345678901234567', // Example - replace with real IDs
    'dogecraft': '1023456789012345678',
    'hyfable': '1034567890123456789',
    'hyperion': '1045678901234567890',
    'hysync': '1056789012345678901',
};

/**
 * Fetch Discord server info using the widget API
 * Widget must be enabled on the Discord server
 */
export async function getDiscordServerInfo(serverId: string): Promise<DiscordServerInfo | null> {
    try {
        const response = await fetch(
            `https://discord.com/api/guilds/${serverId}/widget.json`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            // Widget might be disabled
            return {
                id: serverId,
                onlineMembers: 0,
                available: false,
            };
        }

        const data: DiscordWidgetData = await response.json();

        return {
            id: serverId,
            name: data.name,
            onlineMembers: data.presence_count,
            inviteUrl: data.instant_invite || undefined,
            available: true,
        };
    } catch (error) {
        console.error(`Error fetching Discord info for ${serverId}:`, error);
        return null;
    }
}

/**
 * Fetch Discord member count from invite link
 * Works even if widget is disabled
 */
export async function getDiscordFromInvite(inviteCode: string): Promise<DiscordServerInfo | null> {
    try {
        // Extract invite code from URL if needed
        const code = inviteCode.includes('discord')
            ? inviteCode.split('/').pop()?.split('?')[0]
            : inviteCode;

        if (!code) return null;

        const response = await fetch(
            `https://discord.com/api/v9/invites/${code}?with_counts=true`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 },
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        return {
            id: data.guild?.id || code,
            name: data.guild?.name,
            onlineMembers: data.approximate_presence_count || 0,
            inviteUrl: `https://discord.gg/${code}`,
            available: true,
        };
    } catch (error) {
        console.error(`Error fetching Discord invite ${inviteCode}:`, error);
        return null;
    }
}

/**
 * Extract Discord invite code from various URL formats
 */
export function extractDiscordInviteCode(url: string): string | null {
    if (!url) return null;

    const patterns = [
        /discord\.gg\/([a-zA-Z0-9]+)/,
        /discord\.com\/invite\/([a-zA-Z0-9]+)/,
        /discordapp\.com\/invite\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    // Maybe it's just the code
    if (/^[a-zA-Z0-9]+$/.test(url)) {
        return url;
    }

    return null;
}
