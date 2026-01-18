import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about HytaleTop, server listings, voting, and more.',
};

const faqs = [
    {
        question: 'What is HytaleTop?',
        answer: 'HytaleTop.fun is the #1 Hytale servers list platform. We help players discover the best Hytale multiplayer servers with real-time status, player counts, ping tests, and community reviews.',
    },
    {
        question: 'Is HytaleTop free to use?',
        answer: 'Yes! HytaleTop is completely free for both players and server owners. Browsing servers, voting, and listing your own server costs nothing.',
    },
    {
        question: 'How do I add my server to HytaleTop?',
        answer: 'Simply sign in with Google, click "Add Server" in the navigation menu, fill in your server details (name, IP, description, category), upload a banner image, and submit. Your server will appear immediately.',
    },
    {
        question: 'How do I vote for a server?',
        answer: 'Visit any server page and click the "Vote" button. You can vote once per server every 24 hours. Voting helps servers gain visibility and shows appreciation for great communities.',
    },
    {
        question: 'What is the ping test feature?',
        answer: 'Our exclusive ping test measures your real-time connection latency to any server before you join. Lower ping means smoother gameplay with less lag. The test shows your ping rated from Excellent to Poor.',
    },
    {
        question: 'How do I join a Hytale server?',
        answer: 'Launch Hytale, go to Multiplayer, click "Add Server" or "Direct Connect", enter the server IP address (found on our server pages), and click Connect. Some servers may require additional registration.',
    },
    {
        question: 'Can I edit or delete my server listing?',
        answer: 'Yes! As the server owner, you can edit or delete your listing anytime. Go to your server page while logged in, and you\'ll see Edit and Delete buttons.',
    },
    {
        question: 'What server categories are available?',
        answer: 'We support: Survival, PvP, Minigames, Roleplay, Creative, Economy, and Adventure. Choose the category that best represents your server\'s main gameplay.',
    },
    {
        question: 'How are servers ranked?',
        answer: 'Servers are primarily ranked by community votes. The more votes a server receives, the higher it appears in our Top 100 and search results.',
    },
    {
        question: 'Is HytaleTop affiliated with Hypixel Studios?',
        answer: 'No, HytaleTop is an independent community platform. We are not affiliated with Hypixel Studios or Riot Games.',
    },
];

export default function FAQPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1>Frequently Asked Questions</h1>
                    <p>Everything you need to know about HytaleTop</p>
                </header>

                <div className={styles.faqList}>
                    {faqs.map((faq, index) => (
                        <details key={index} className={styles.faqItem}>
                            <summary>{faq.question}</summary>
                            <p>{faq.answer}</p>
                        </details>
                    ))}
                </div>

                <div className={styles.contact}>
                    <h2>Still have questions?</h2>
                    <p>Can't find what you're looking for? Get in touch with us.</p>
                    <Link href="/contact" className="btn btn-primary">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
