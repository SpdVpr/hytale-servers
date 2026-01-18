'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Server, Users, ThumbsUp, Sparkles, ArrowRight, Zap, Shield, Globe,
  Trophy, Target, Gamepad2, Play, Crown, Filter, Star
} from 'lucide-react';
import ServerCard from '@/components/ServerCard';
import { Server as ServerType, CATEGORY_INFO, ServerCategory } from '@/lib/types';
import styles from './page.module.css';

interface Stats {
  totalServers: number;
  totalPlayers: number;
  totalVotes: number;
  onlineServers: number;
}

type SortMode = 'votes' | 'rating';

export default function HomePage() {
  const [servers, setServers] = useState<ServerType[]>([]);
  const [stats, setStats] = useState<Stats>({ totalServers: 0, totalPlayers: 0, totalVotes: 0, onlineServers: 0 });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('votes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/servers?sortBy=votes&pageSize=50');
        const data = await response.json();

        if (data.success && data.servers) {
          setServers(data.servers);
          setStats(data.stats || {
            totalServers: data.servers.length,
            totalPlayers: data.servers.reduce((sum: number, s: ServerType) => sum + s.currentPlayers, 0),
            totalVotes: data.servers.reduce((sum: number, s: ServerType) => sum + s.votes, 0),
            onlineServers: data.servers.filter((s: ServerType) => s.isOnline).length,
          });
        }
      } catch (error) {
        console.error('Error loading servers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sort servers based on sortMode
  const sortedServers = [...servers].sort((a, b) => {
    if (sortMode === 'rating') {
      // Sort by average rating (with votes as tiebreaker)
      const ratingA = a.averageRating || 0;
      const ratingB = b.averageRating || 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
      return b.votes - a.votes; // Tiebreaker
    }
    // Default: sort by votes
    return b.votes - a.votes;
  });

  // Top 3 servers by votes for podium
  const topByVotes = servers.slice(0, 3);

  // Top 3 servers by rating
  const topByRating = [...servers]
    .filter(s => s.averageRating && s.averageRating > 0)
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

  // Filter servers by category
  const displayServers = activeCategory
    ? sortedServers.filter(s => s.category === activeCategory)
    : sortedServers;

  return (
    <>
      {/* JSON-LD Schema for SEO & LLM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://hytaletop.fun/#website",
                "url": "https://hytaletop.fun",
                "name": "HytaleTop",
                "description": "Find the best Hytale servers with real-time player counts, ping tests and community reviews.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://hytaletop.fun/servers?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://hytaletop.fun/#organization",
                "name": "HytaleTop",
                "url": "https://hytaletop.fun",
                "logo": "https://hytaletop.fun/logo-server-final.png",
                "sameAs": []
              },
              {
                "@type": "ItemList",
                "name": "Best Hytale Servers",
                "description": "Top-rated Hytale multiplayer servers ranked by community votes",
                "numberOfItems": stats.totalServers,
                "itemListElement": topByVotes.map((server, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "GameServer",
                    "name": server.name,
                    "description": server.shortDescription,
                    "url": `https://hytaletop.fun/servers/${server.slug}`,
                    "playersOnline": server.currentPlayers
                  }
                }))
              }
            ]
          })
        }}
      />

      {/* Compact Hero with Podium */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            {/* Left: Branding & Stats */}
            <div className={styles.heroLeft}>
              <div className={styles.heroBadge}>
                <Crown size={14} />
                <span>#1 Hytale Servers List 2026</span>
              </div>
              <h1 className={styles.heroTitle}>
                Find The Best
                <span className={styles.titleHighlight}> Hytale Servers</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Browse our Hytale servers list with real-time ping tests, player counts & community reviews. Find the perfect PvP, survival or minigame server.
              </p>

              {/* Inline Stats */}
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.statValue}>{stats.totalServers}</span>
                  <span className={styles.statLabel}>Servers</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.statValue}>{stats.totalVotes.toLocaleString()}</span>
                  <span className={styles.statLabel}>Votes</span>
                </div>
              </div>
            </div>

            {/* Right: Dual Podiums */}
            <div className={styles.heroPodiums}>
              {/* Top by Votes */}
              <div className={styles.heroPodium}>
                <h2 className={styles.podiumTitle}>
                  <ThumbsUp size={16} />
                  Top by Votes
                </h2>

                {loading ? (
                  <div className={styles.podiumLoading}>
                    <div className={styles.loadingSpinner} />
                  </div>
                ) : (
                  <div className={styles.podiumList}>
                    {topByVotes.map((server, idx) => (
                      <Link
                        key={server.id}
                        href={`/servers/${server.slug || server.id}`}
                        className={styles.podiumItem}
                      >
                        <span className={`${styles.podiumRank} ${styles[`rank${idx + 1}`]}`}>
                          {idx + 1}
                        </span>
                        <div className={styles.podiumServerInfo}>
                          <span className={styles.podiumServerName}>{server.name}</span>
                          <span className={styles.podiumServerVotes}>
                            <ThumbsUp size={12} />
                            {server.votes.toLocaleString()}
                          </span>
                        </div>
                        <ArrowRight size={16} className={styles.podiumArrow} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Top by Rating */}
              <div className={styles.heroPodium}>
                <h2 className={styles.podiumTitle}>
                  <Star size={16} />
                  Top by Rating
                </h2>

                {loading ? (
                  <div className={styles.podiumLoading}>
                    <div className={styles.loadingSpinner} />
                  </div>
                ) : topByRating.length > 0 ? (
                  <div className={styles.podiumList}>
                    {topByRating.map((server, idx) => (
                      <Link
                        key={server.id}
                        href={`/servers/${server.slug || server.id}`}
                        className={styles.podiumItem}
                      >
                        <span className={`${styles.podiumRank} ${styles[`rank${idx + 1}`]}`}>
                          {idx + 1}
                        </span>
                        <div className={styles.podiumServerInfo}>
                          <span className={styles.podiumServerName}>{server.name}</span>
                          <span className={styles.podiumServerRating}>
                            <Star size={12} className={styles.starIconSmall} />
                            {server.averageRating?.toFixed(1)}
                          </span>
                        </div>
                        <ArrowRight size={16} className={styles.podiumArrow} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={styles.podiumEmpty}>
                    No rated servers yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Server List with Categories */}
      <section className={styles.serversSection}>
        <div className="container">
          {/* Category Tabs - Clean & Minimal */}
          <div className={styles.categoryTabs}>
            <button
              className={`${styles.categoryTab} ${!activeCategory ? styles.categoryTabActive : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              <Sparkles size={16} />
              <span>All Servers</span>
            </button>
            {(Object.entries(CATEGORY_INFO) as [ServerCategory, typeof CATEGORY_INFO[ServerCategory]][])
              .map(([key, info]) => (
                <button
                  key={key}
                  className={`${styles.categoryTab} ${activeCategory === key ? styles.categoryTabActive : ''}`}
                  onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                >
                  <span className={styles.categoryIcon}>{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              ))}
          </div>

          {/* Sort Mode Toggle */}
          <div className={styles.sortToggle}>
            <span className={styles.sortLabel}>Sort by:</span>
            <div className={styles.sortButtons}>
              <button
                className={`${styles.sortBtn} ${sortMode === 'votes' ? styles.sortBtnActive : ''}`}
                onClick={() => setSortMode('votes')}
              >
                <ThumbsUp size={14} />
                Votes
              </button>
              <button
                className={`${styles.sortBtn} ${sortMode === 'rating' ? styles.sortBtnActive : ''}`}
                onClick={() => setSortMode('rating')}
              >
                <Star size={14} />
                Rating
              </button>
            </div>
          </div>

          {/* Server Grid */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Loading servers...</p>
            </div>
          ) : displayServers.length === 0 ? (
            <div className={styles.emptyState}>
              <Gamepad2 size={48} />
              <h3>No servers found</h3>
              <p>Try selecting a different category</p>
              <button onClick={() => setActiveCategory(null)} className="btn btn-ghost">
                Show All Servers
              </button>
            </div>
          ) : (
            <>
              <div className={styles.serverGrid}>
                {displayServers.slice(0, 12).map((server, index) => (
                  <ServerCard key={server.id} server={server} rank={activeCategory ? undefined : index + 1} />
                ))}
              </div>

              {displayServers.length > 12 && (
                <div className={styles.loadMoreRow}>
                  <Link href={`/servers${activeCategory ? `?category=${activeCategory}` : ''}`} className="btn btn-primary btn-lg">
                    Browse All {displayServers.length} Servers
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why HytaleTop - Compact */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <Target size={24} />
              <div>
                <h3>Real-Time Ping</h3>
                <p>Test your actual latency before joining</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <Shield size={24} />
              <div>
                <h3>Verified Servers</h3>
                <p>Trusted by the community</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <Users size={24} />
              <div>
                <h3>Player Reviews</h3>
                <p>Read real experiences</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <Zap size={24} />
              <div>
                <h3>Live Stats</h3>
                <p>Updated every minute</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2>Own a Hytale Server?</h2>
              <p>List your server for free and reach thousands of players</p>
            </div>
            <Link href="/submit" className="btn btn-accent btn-lg">
              <Play size={20} />
              Add Your Server
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section with JSON-LD Schema */}
      <section className={styles.faqSection}>
        <div className="container">
          <h2 className={styles.faqTitle}>
            <span>❓</span> Frequently Asked Questions About Hytale Servers
          </h2>
          <p className={styles.faqSubtitle}>
            Everything you need to know about finding and joining Hytale servers
          </p>

          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>What is the best Hytale servers list?</summary>
              <p>
                HytaleTop.fun is the #1 Hytale servers list, featuring real-time player counts,
                ping tests, and community reviews. We help you find the perfect server for PvP,
                survival, minigames, roleplay, and more. Our list is updated constantly to show
                active and high-quality servers.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>How do I find Hytale multiplayer servers?</summary>
              <p>
                Finding Hytale multiplayer servers is easy with HytaleTop. Simply browse our
                categorized server list, use filters to find servers by game mode (PvP, survival,
                minigames), check player counts, read community reviews, and test your ping
                before joining. Click on any server to see detailed information and join instructions.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>How do I join a Hytale server?</summary>
              <p>
                To join a Hytale server: 1) Launch Hytale game, 2) Go to Multiplayer,
                3) Click &quot;Add Server&quot; or &quot;Direct Connect&quot;, 4) Enter the server IP address
                (found on our server pages), 5) Click Connect. Some servers may require
                registration on their website or Discord first.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>What types of Hytale servers are available?</summary>
              <p>
                Our Hytale servers list includes many game modes: <strong>Survival</strong> -
                classic survival gameplay with PvE, <strong>PvP</strong> - player vs player combat
                and faction wars, <strong>Minigames</strong> - various mini-games like SkyWars
                and BedWars, <strong>Roleplay</strong> - immersive RP servers with jobs and economy,
                <strong>Creative</strong> - building and creation focused, and more.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>How do I add my Hytale server to the list?</summary>
              <p>
                Adding your server to HytaleTop is free and easy: 1) Sign in with Google,
                2) Click &quot;Add Server&quot; in the menu, 3) Fill in your server details (name, IP,
                description, category), 4) Upload a banner image, 5) Submit! Your server
                will be listed immediately. You can edit or remove your server anytime.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>What is the ping test feature?</summary>
              <p>
                Our exclusive ping test feature allows you to measure your real-time latency
                to any Hytale server before joining. Lower ping means smoother gameplay with
                less lag. Click &quot;Test Ping&quot; on any server page to see your connection quality
                rated from Excellent to Poor.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the best Hytale servers list?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HytaleTop.fun is the #1 Hytale servers list, featuring real-time player counts, ping tests, and community reviews. We help you find the perfect server for PvP, survival, minigames, roleplay, and more."
                }
              },
              {
                "@type": "Question",
                "name": "How do I find Hytale multiplayer servers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Finding Hytale multiplayer servers is easy with HytaleTop. Browse our categorized server list, use filters to find servers by game mode, check player counts, read community reviews, and test your ping before joining."
                }
              },
              {
                "@type": "Question",
                "name": "How do I join a Hytale server?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To join a Hytale server: 1) Launch Hytale game, 2) Go to Multiplayer, 3) Click Add Server or Direct Connect, 4) Enter the server IP address, 5) Click Connect."
                }
              },
              {
                "@type": "Question",
                "name": "What types of Hytale servers are available?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our Hytale servers list includes Survival, PvP, Minigames, Roleplay, Creative, Economy, and Adventure servers."
                }
              },
              {
                "@type": "Question",
                "name": "How do I add my Hytale server to the list?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Adding your server to HytaleTop is free. Sign in with Google, click Add Server, fill in details, upload a banner, and submit. Your server will be listed immediately."
                }
              },
              {
                "@type": "Question",
                "name": "What is the ping test feature?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our exclusive ping test feature measures your real-time latency to any Hytale server before joining. Lower ping means smoother gameplay with less lag."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
