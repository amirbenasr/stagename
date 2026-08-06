"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

interface RebrandButtonProps {
  brandKitSlug: string;
  nameIndex: number;
  stageName: string;
}

export default function RebrandButton({
  brandKitSlug,
  nameIndex,
  stageName,
}: RebrandButtonProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(
          `/api/rebrand-vote?slug=${brandKitSlug}`
        );
        if (res.ok) {
          const data = await res.json();
          setCount(data.counts?.[nameIndex] ?? 0);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [brandKitSlug, nameIndex]);

  useEffect(() => {
    const stored = localStorage.getItem(
      `rebrand-voted-${brandKitSlug}-${nameIndex}`
    );
    if (stored === "1") setVoted(true);
  }, [brandKitSlug, nameIndex]);

  const handleVote = async () => {
    if (voting || voted) return;
    setVoting(true);

    try {
      const res = await fetch("/api/rebrand-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandKitSlug,
          nameIndex,
          stageName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setVoted(true);
        localStorage.setItem(
          `rebrand-voted-${brandKitSlug}-${nameIndex}`,
          "1"
        );
      }
    } catch {
      // silent
    } finally {
      setVoting(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={voting || voted}
      className={`group flex items-center gap-2 rounded-full px-4 py-2 font-serif text-xs uppercase tracking-wider transition-all duration-300 ${
        voted
          ? "bg-pink-accent/10 border-2 border-pink-accent/30 text-pink-accent cursor-default"
          : "border-2 border-foreground/15 text-foreground/60 hover:border-pink-accent hover:text-pink-accent hover:scale-105"
      } disabled:opacity-70`}
      title={voted ? "You already voted for this name" : "Vote for this name"}
    >
      {voting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <RefreshCw
          size={14}
          className={voted ? "text-pink-accent" : "group-hover:rotate-180 transition-transform duration-500"}
        />
      )}
      <span className="font-bold">Yes, rebrand!</span>
      {!loading && count > 0 && (
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            voted
              ? "bg-pink-accent/20 text-pink-accent"
              : "bg-foreground/8 text-foreground/50"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
