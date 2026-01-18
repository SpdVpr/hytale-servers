/**
 * Script to scrape server data from hytale-servers.com
 * Downloads banners to public/banners/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/banners');
const SERVERS_OUTPUT = path.join(__dirname, '../src/lib/api/scraped-servers.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Fetch URL content
 */
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

/**
 * Download image to file
 */
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(OUTPUT_DIR, filename);

        // Check if already downloaded
        if (fs.existsSync(filePath)) {
            console.log(`    ✓ Already exists: ${filename}`);
            return resolve(`/banners/${filename}`);
        }

        const file = fs.createWriteStream(filePath);

        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`    ✓ Downloaded: ${filename}`);
                    resolve(`/banners/${filename}`);
                });
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                // Follow redirect
                file.close();
                fs.unlinkSync(filePath);
                downloadImage(res.headers.location, filename).then(resolve).catch(reject);
            } else {
                file.close();
                fs.unlinkSync(filePath);
                reject(new Error(`HTTP ${res.statusCode}`));
            }
        }).on('error', err => {
            file.close();
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            reject(err);
        });
    });
}

/**
 * Extract unique banner URLs from HTML
 */
function extractBannerUrls(html) {
    const banners = new Map();

    // Match URL-encoded S3 banner URLs
    const pattern = /hytale-servers-com-prod\.s3\.us-east-1\.amazonaws\.com%2F(\d+)_banner_([a-f0-9]+)\.(\w+)/g;

    let match;
    while ((match = pattern.exec(html)) !== null) {
        const id = match[1];
        const hash = match[2];
        const ext = match[3];
        const url = `https://hytale-servers-com-prod.s3.us-east-1.amazonaws.com/${id}_banner_${hash}.${ext}`;
        if (!banners.has(id)) {
            banners.set(id, { id, url, ext });
        }
    }

    return Array.from(banners.values());
}

/**
 * Extract server data from escaped JSON in HTML
 */
function extractServers(html) {
    const servers = [];

    // Unescape the HTML
    const unescaped = html
        .replace(/\\\\"/g, '"')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, ' ')
        .replace(/\\\\/g, '\\');

    // Pattern for server data
    const serverPattern = /"name":"([^"]+)","slug":"([^"]+)","ip":"([^"]+)","port":(\d+),"description":"((?:[^"]|"(?!,))*)","country":"([A-Z]{2})"/g;

    let match;
    while ((match = serverPattern.exec(unescaped)) !== null) {
        const name = match[1];

        // Skip if already exists
        if (servers.find(s => s.name === name)) continue;

        // Find additional data after the match
        const afterMatch = unescaped.substring(match.index, match.index + 2000);

        // Extract votes
        const votesMatch = afterMatch.match(/"votes":(\d+)/);
        const votes = votesMatch ? parseInt(votesMatch[1]) : 0;

        // Extract discord
        const discordMatch = afterMatch.match(/"discord_url":"(https?:\/\/[^"]*)"/);
        const discord = discordMatch ? discordMatch[1] : null;

        // Extract website
        const websiteMatch = afterMatch.match(/"website_url":"(https?:\/\/[^"]*)"/);
        const website = websiteMatch ? websiteMatch[1] : null;

        // Extract banner URL
        const bannerMatch = afterMatch.match(/"banner":\{"url":"(https:\/\/[^"]+)"/);
        const bannerUrl = bannerMatch ? bannerMatch[1] : null;

        servers.push({
            name,
            slug: match[2],
            ip: match[3],
            port: parseInt(match[4]),
            description: match[5].substring(0, 400),
            country: match[6],
            votes,
            discord,
            website,
            bannerUrl
        });
    }

    return servers;
}

async function main() {
    console.log('🔍 Scraping Hytale servers...\n');

    try {
        // Fetch main page
        console.log('📥 Fetching hytale-servers.com...');
        const html = await fetchUrl('https://hytale-servers.com/');
        console.log(`   Got ${(html.length / 1024).toFixed(0)} KB\n`);

        // Extract servers
        const servers = extractServers(html);
        console.log(`📊 Found ${servers.length} servers\n`);

        // Download banners
        console.log('🖼️  Downloading banners...\n');

        for (const server of servers) {
            if (server.bannerUrl) {
                try {
                    const ext = server.bannerUrl.split('.').pop() || 'png';
                    const filename = `${server.slug}.${ext}`;
                    server.banner = await downloadImage(server.bannerUrl, filename);
                } catch (err) {
                    console.log(`    ✗ ${server.name}: ${err.message}`);
                    server.banner = null;
                }
            } else {
                server.banner = null;
            }
            delete server.bannerUrl;
        }

        // Save to JSON
        fs.writeFileSync(SERVERS_OUTPUT, JSON.stringify(servers, null, 2));
        console.log(`\n✅ Saved to ${SERVERS_OUTPUT}`);

        // Print summary
        console.log('\n📋 Summary:\n');
        const withBanner = servers.filter(s => s.banner).length;
        const withDiscord = servers.filter(s => s.discord).length;
        console.log(`   Total: ${servers.length} servers`);
        console.log(`   With banner: ${withBanner}`);
        console.log(`   With Discord: ${withDiscord}`);

        console.log('\n🎮 Servers:\n');
        servers.forEach(s => {
            const banner = s.banner ? '🖼️' : '❌';
            const discord = s.discord ? '💬' : '  ';
            console.log(`   ${banner} ${discord} ${s.name} (${s.votes} votes)`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();
