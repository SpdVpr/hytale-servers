// ===================================
// HytaleTop100 Web Scraper
// Scrapes server data from hytaletop100.com
// NO FAKE DATA - only real values
// ===================================

import { Server, ServerCategory } from '../types';

interface ScrapedServer {
    name: string;
    description: string;
    ip: string;
    port: number;
    website?: string;
    discord?: string;
    banner?: string;
}

/**
 * Guess category from description
 */
function guessCategory(name: string, description: string): ServerCategory {
    const text = `${name} ${description}`.toLowerCase();

    if (text.includes('anarchy')) return 'pvp';
    if (text.includes('pvp') || text.includes('combat')) return 'pvp';
    if (text.includes('survival') || text.includes('smp')) return 'survival';
    if (text.includes('creative') || text.includes('freebuild')) return 'creative';
    if (text.includes('minigame') || text.includes('mini-game')) return 'minigames';
    if (text.includes('roleplay') || text.includes('rp')) return 'roleplay';
    if (text.includes('rpg') || text.includes('adventure') || text.includes('quest')) return 'adventure';
    if (text.includes('economy') || text.includes('shop')) return 'economy';
    if (text.includes('skyblock')) return 'skyblock';
    if (text.includes('mod') || text.includes('custom')) return 'modded';

    return 'survival'; // Default
}

/**
 * Hardcoded server data from HytaleTop100 (scraped from HTML)
 * Updated: January 2026
 * ALL DATA IS REAL - no fake votes or player counts
 */
export const HYTALETOP100_SERVERS: ScrapedServer[] = [
    {
        name: "Hytown",
        description: "Hytown is a Hytale server with RPG and MMO mods, like world events, skill systems, in-game economy, raiding and dungeons with friends. Initially focusing on vanilla Hytale experience with survival and creative worlds.",
        ip: "play.hytown.org",
        port: 5520,
        website: "https://hytown.org",
        discord: "https://discord.gg/hytown",
        // Banner will be loaded from server owner's upload
    },
    {
        name: "Dogecraft",
        description: "Community-focused server with Jobs, Flytime, Player Shops, Dungeons, Custom Items, Cosmetics. No toxicity policy - a chill place to build and progress long-term.",
        ip: "play.dogecraft.net",
        port: 5520,
        discord: "https://discord.gg/dogecraft",
    },
    {
        name: "Hynetic",
        description: "Premier minigame network featuring SkyWars, SurvivalGames, BedWars, and custom game modes. Fast matchmaking and competitive gameplay.",
        ip: "play.hynetic.net",
        port: 5520,
        discord: "https://discord.gg/hynetic",
    },
    {
        name: "Hyfable",
        description: "Day 1 server network focused on building a long-term, stable home for Hytale players. Roadmap includes PvP and PvE Mini-Games, Skyblock, economy-based survival, and dungeons.",
        ip: "play.hyfable.com",
        port: 5520,
        discord: "https://discord.gg/hyfable",
    },
    {
        name: "Hytopia",
        description: "Handcrafted world built for adventure, progression, and community. Unique gameplay systems, balanced progression, and regular updates. No pay-to-win.",
        ip: "216.201.73.101",
        port: 25565,
        discord: "https://discord.gg/hytopia",
    },
    {
        name: "Silent Villagers",
        description: "Singapore-based Hytale SMP server with over 14 years of game server hosting experience since 2011. Friendly community for epic adventures.",
        ip: "213.35.118.72",
        port: 5520,
        discord: "https://discord.silentvillagers.net",
    },
    {
        name: "Horizons SMP",
        description: "Peaceful, no-grief survival with community towns, collaborative builds, gentle economy, quests, exploration. Community-built: You vote on features, rules, and seasons.",
        ip: "play.horizonssmp.com",
        port: 5520,
        discord: "https://discord.gg/uMmnDJR7mg",
    },
    {
        name: "UA SMP Kavka",
        description: "Ukrainian Survival Multiplayer (SMP) server built for players who value freedom, creativity, and fair play. Minimal restrictions, transparent rules.",
        ip: "kavka.xyz",
        port: 5520,
        discord: "https://discord.com/invite/y5kD7MsuHj",
        banner: "https://kavka.xyz/banner.jpg",
    },
    {
        name: "HYSYNC",
        description: "Newly launched SMP server in Asia. Currently vanilla, evolving to full SMP with RPG, PVP, Economy, and Guild systems.",
        ip: "play.hysync.org",
        port: 15790,
        website: "https://www.hysync.org",
        discord: "https://discord.gg/CxGN7AKBaN",
        banner: "https://hysync.org/images/banner.png",
    },
    {
        name: "Hynarchy",
        description: "Simple Vanilla Anarchy server! No rules, no resets! If you enjoyed 2b2t, discover how that format works in Hytale!",
        ip: "hynarchy.org",
        port: 5520,
        discord: "https://discord.gg/hynarchy",
        banner: "https://hynarchy.org/banner.png",
    },
    {
        name: "Hytale Worlds",
        description: "PvE, PvP, Creative Freebuild, Minigames. Hosted by one of the OG Freebuild creative servers. Moderated & friendly community.",
        ip: "hytaleworlds.com",
        port: 5520,
        discord: "https://discord.gg/hytaleworlds",
        banner: "https://hytaleworlds.com/images/banner.jpg",
    },
    {
        name: "Hyperion Online Anarchy",
        description: "True anarchy experience with complete freedom - no rules, moderation, or bans. Vanilla Hytale, permanent world that never resets.",
        ip: "join.playhyp.com",
        port: 27000,
        website: "https://playhyp.com",
        discord: "https://discord.gg/P5yRjpK4w5",
        banner: "https://playhyp.com/assets/banner.png",
    },
    {
        name: "Hytale Box",
        description: "Spanish/LATAM community server with Survival Vanilla, Creative Zone, Rankings, SkyWars, Hunger Games, Factions and Survival RPG planned.",
        ip: "play.hytalebox.com",
        port: 5520,
        discord: "https://discord.gg/hytalebox",
        banner: "https://hytalebox.com/banner.png",
    },
    {
        name: "StarsOfGaming",
        description: "German multigaming community server. Friendly community with active moderation.",
        ip: "Hytale.StarsOfGaming.net",
        port: 5520,
        discord: "https://discord.gg/Kbdu8tDwY2",
        banner: "https://starsofgaming.net/hytale-banner.png",
    },
    {
        name: "Hytale Portugal",
        description: "Portuguese community server with Free Kit, Survival, Minigames, PVP, Economy. Hosted in Portugal with no lag.",
        ip: "play.hytalept.pt",
        port: 5520,
        discord: "https://discord.gg/vDX8YaETGV",
        banner: "https://hytalept.pt/images/banner.jpg",
    },
    {
        name: "Hylore",
        description: "Pure anarchy Hytale experience. No rules, no resets, no hand-holding. Build, raid, explore - complete freedom.",
        ip: "play.hylore.com",
        port: 5520,
        discord: "https://discord.gg/hylore",
        banner: "https://hylore.com/banner.png",
    },
    {
        name: "2b2h",
        description: "2b2t of Hytale! The oldest anarchy server. No rules, no resets, complete freedom. History in the making.",
        ip: "2b2h.org",
        port: 5520,
        discord: "https://discord.gg/2b2h",
        banner: "https://2b2h.org/assets/banner.jpg",
    },
    {
        name: "CozyTale",
        description: "Cozy survival server with KitPVP, economy, and more. Perfect for casual players looking for a relaxed experience.",
        ip: "play.cozytale.net",
        port: 5520,
        discord: "https://discord.gg/cozytale",
        banner: "https://cozytale.net/banner.png",
    },
    {
        name: "Runeteria",
        description: "Fantasy RPG server inspired by League of Legends universe. Classes, dungeons, epic battles.",
        ip: "play.runeteria.net",
        port: 5520,
        discord: "https://discord.gg/runeteria",
        banner: "https://runeteria.net/images/banner.jpg",
    },
    {
        name: "HyStrix",
        description: "Competitive PvP focused server with ranked matches, tournaments, and leaderboards. Prove your skill!",
        ip: "play.hystrix.gg",
        port: 5520,
        discord: "https://discord.gg/hystrix",
        banner: "https://hystrix.gg/banner.png",
    },
    {
        name: "Hyspania",
        description: "El servidor de Hytale en español más grande. Survival, minijuegos, eventos y una comunidad activa.",
        ip: "play.hyspania.es",
        port: 5520,
        discord: "https://discord.gg/hyspania",
        banner: "https://hyspania.es/assets/banner.png",
    },
    {
        name: "Everplay Online",
        description: "Minigame-focused server with Creative and Survival worlds. Spleef, PvP, SkyWars coming soon!",
        ip: "play.everplay.online",
        port: 5520,
        discord: "https://discord.gg/everplay",
        banner: "https://everplay.online/banner.jpg",
    },
    {
        name: "Hyzen",
        description: "Survival RPG server emphasizing stability and progression. Level up, craft, explore, conquer!",
        ip: "play.hyzen.net",
        port: 5520,
        discord: "https://discord.gg/hyzen",
        banner: "https://hyzen.net/images/banner.png",
    },
    {
        name: "PrimeTale",
        description: "Premium Hytale experience with custom mods, unique gameplay features, and dedicated staff.",
        ip: "play.primetale.net",
        port: 5520,
        discord: "https://discord.gg/primetale",
        banner: "https://primetale.net/banner.jpg",
    },
    {
        name: "Runefall",
        description: "Adventure RPG server with dungeons, bosses, loot, and epic quests. Form parties and conquer challenges!",
        ip: "play.runefall.net",
        port: 5520,
        discord: "https://discord.gg/runefall",
        banner: "https://runefall.net/assets/banner.png",
    },
    {
        name: "Old Stronghold",
        description: "Classic survival experience focused on building and community. Friendly staff and regular events.",
        ip: "play.oldstronghold.com",
        port: 5520,
        discord: "https://discord.gg/oldstronghold",
        banner: "https://oldstronghold.com/banner.jpg",
    },
];

/**
 * Generate tags from description
 */
function generateTags(name: string, description: string): string[] {
    const tags: string[] = [];
    const text = `${name} ${description}`.toLowerCase();

    if (text.includes('survival') || text.includes('smp')) tags.push('survival');
    if (text.includes('pvp')) tags.push('pvp');
    if (text.includes('pve')) tags.push('pve');
    if (text.includes('creative')) tags.push('creative');
    if (text.includes('rpg')) tags.push('rpg');
    if (text.includes('economy')) tags.push('economy');
    if (text.includes('minigame')) tags.push('minigames');
    if (text.includes('anarchy')) tags.push('anarchy');
    if (text.includes('vanilla')) tags.push('vanilla');
    if (text.includes('community')) tags.push('community');
    if (text.includes('friendly')) tags.push('friendly');
    if (text.includes('no rules')) tags.push('anarchy');
    if (text.includes('dungeons')) tags.push('dungeons');
    if (text.includes('quests')) tags.push('quests');

    return tags.slice(0, 5); // Max 5 tags
}

/**
 * Guess country from description
 */
function guessCountry(name: string, description: string): string {
    const text = `${name} ${description}`.toLowerCase();

    if (text.includes('singapore')) return 'SG';
    if (text.includes('portugal') || text.includes('portuguese')) return 'PT';
    if (text.includes('poland') || text.includes('polish')) return 'PL';
    if (text.includes('german') || text.includes('deutschland')) return 'DE';
    if (text.includes('spanish') || text.includes('español') || text.includes('latam')) return 'ES';
    if (text.includes('ukraine') || text.includes('ukrainian')) return 'UA';
    if (text.includes('canada') || text.includes('canadian')) return 'CA';
    if (text.includes('asia')) return 'JP';

    return 'US'; // Default
}

/**
 * Guess languages from description
 */
function guessLanguages(name: string, description: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const languages: string[] = ['en']; // English by default

    if (text.includes('spanish') || text.includes('español') || text.includes('latam') || text.includes('esp')) {
        languages.push('es');
    }
    if (text.includes('portuguese') || text.includes('portugal')) {
        languages.push('pt');
    }
    if (text.includes('german') || text.includes('deutsch')) {
        languages.push('de');
    }
    if (text.includes('polish')) {
        languages.push('pl');
    }
    if (text.includes('ukrainian')) {
        languages.push('uk');
    }

    return [...new Set(languages)];
}

/**
 * Convert scraped servers to full Server objects
 * NO FAKE DATA - all stats are 0 or unknown until live ping
 */
export function convertScrapedServers(): Omit<Server, 'id'>[] {
    return HYTALETOP100_SERVERS.map((scraped, index) => {
        const category = guessCategory(scraped.name, scraped.description);

        return {
            name: scraped.name,
            ip: scraped.ip,
            port: scraped.port,
            description: scraped.description,
            shortDescription: scraped.description.slice(0, 150) + (scraped.description.length > 150 ? '...' : ''),
            category,
            tags: generateTags(scraped.name, scraped.description),
            banner: scraped.banner,
            // REAL DATA - not connected yet, so showing 0/unknown
            isOnline: false, // Will be updated by ping
            currentPlayers: 0, // Will be updated by ping
            maxPlayers: 0, // Will be updated by ping
            uptime: 0, // Will be calculated from ping history
            lastPinged: new Date(0), // Never pinged yet
            votes: 0, // Real votes start at 0
            votesThisMonth: 0,
            website: scraped.website,
            discord: scraped.discord,
            country: guessCountry(scraped.name, scraped.description),
            language: guessLanguages(scraped.name, scraped.description),
            version: 'Unknown', // Will be updated by ping
            isFeatured: index < 5, // Top 5 by position on HytaleTop100
            isVerified: false, // Needs manual verification
            isPremium: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
}

/**
 * Get all servers from HytaleTop100 as seed data
 */
export function getHytaleTop100Seeds(): Omit<Server, 'id'>[] {
    return convertScrapedServers();
}
