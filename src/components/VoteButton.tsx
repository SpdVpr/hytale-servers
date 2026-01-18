'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, Check, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './VoteButton.module.css';

interface VoteButtonProps {
    serverId: string;
    initialVotes?: number;
    onVoteSuccess?: (newCount: number) => void;
}

export default function VoteButton({ serverId, initialVotes, onVoteSuccess }: VoteButtonProps) {
    const { user, signInWithGoogle } = useAuth();
    const [hasVoted, setHasVoted] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user already voted today (from localStorage for quick check)
    useEffect(() => {
        if (!user) {
            setHasVoted(false);
            return;
        }

        try {
            const votes = JSON.parse(localStorage.getItem('server_votes') || '{}');
            const voteKey = `${serverId}_${user.uid}`;
            const lastVote = votes[voteKey];
            if (lastVote) {
                const hoursSinceVote = (Date.now() - lastVote) / (1000 * 60 * 60);
                if (hoursSinceVote < 24) {
                    setHasVoted(true);
                }
            }
        } catch (err) {
            console.error('Error reading vote status:', err);
        }
    }, [serverId, user]);

    const handleVote = async () => {
        setError(null);

        // If not logged in, trigger Google sign-in
        if (!user) {
            try {
                await signInWithGoogle();
                // After sign-in, user state will update and they can try again
            } catch (err) {
                setError('Please sign in to vote');
            }
            return;
        }

        if (hasVoted || isVoting) return;

        setIsVoting(true);

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serverId,
                    userId: user.uid,
                    username: user.displayName || 'Anonymous',
                    userEmail: user.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to vote');
            }

            // Store vote in localStorage to prevent multiple attempts
            const votes = JSON.parse(localStorage.getItem('server_votes') || '{}');
            const voteKey = `${serverId}_${user.uid}`;
            votes[voteKey] = Date.now();
            localStorage.setItem('server_votes', JSON.stringify(votes));

            setHasVoted(true);

            if (onVoteSuccess && data.newVoteCount) {
                onVoteSuccess(data.newVoteCount);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Vote failed';
            setError(message);
            console.error('Vote failed:', err);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <button
                className={`${styles.button} ${hasVoted ? styles.voted : ''} ${!user ? styles.needsLogin : ''}`}
                onClick={handleVote}
                disabled={hasVoted || isVoting}
            >
                {isVoting ? (
                    <>
                        <span className={styles.spinner} />
                        Voting...
                    </>
                ) : hasVoted ? (
                    <>
                        <Check size={20} />
                        Voted Today!
                    </>
                ) : !user ? (
                    <>
                        <LogIn size={20} />
                        Sign in to Vote
                    </>
                ) : (
                    <>
                        <ThumbsUp size={20} />
                        Vote for this Server
                    </>
                )}
            </button>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
