"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, Loader2, Sparkles, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-beige flex items-center justify-center">
          <Loader2 size={24} className="text-pink-accent ai-spinner" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("order_id") || searchParams.get("_ptxn");

  const [brandKitSlug, setBrandKitSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session. Please complete checkout first.");
      setLoading(false);
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/session-lookup?session_id=${sessionId}`);
        if (!res.ok) return false;
        const data = await res.json();
        if (data.brandKitSlug) {
          setBrandKitSlug(data.brandKitSlug);
          setLoading(false);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    poll();

    const interval = setInterval(async () => {
      pollRef.current += 1;
      if (pollRef.current > 20) {
        setError("Generation is taking longer than expected. We'll email you when your brand kit is ready.");
        setLoading(false);
        clearInterval(interval);
        return;
      }
      const found = await poll();
      if (found) clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 holographic rounded-full flex items-center justify-center">
            <Loader2 size={28} className="text-white ai-spinner" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
              Payment confirmed ✨
            </h1>
            <p className="font-serif text-sm text-foreground/50">
              Crafting your brand kit... this may take a minute.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Hang tight!
          </h1>
          <p className="font-serif text-foreground/60 mb-8">{error}</p>
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-sm text-foreground/50 hover:text-foreground transition"
          >
            <Star size={14} />
            Back to stagename.club
          </Link>
        </div>
      </div>
    );
  }

  if (!brandKitSlug) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Almost there!
          </h1>
          <p className="font-serif text-foreground/60 mb-8">
            Your brand kit is being generated. We&apos;ll email you when it&apos;s ready.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-sm text-foreground/50 hover:text-foreground transition"
          >
            <Star size={14} />
            Back to stagename.club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col items-center gap-8">
        {/* Celebration */}
        <div className="w-20 h-20 holographic rounded-full flex items-center justify-center shadow-xl">
          <Sparkles size={32} className="text-white" />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
            Your identity is unlocked ✨
          </h1>
          <p className="font-serif text-foreground/50">
            Your Artist Debut Kit has been crafted. View it online or download as PDF.
          </p>
        </div>

        <Link
          href={`/brand-kit/${brandKitSlug}`}
          className="holographic holographic-shadow rounded-full px-8 py-4 text-white font-serif uppercase tracking-wider font-bold hover:scale-105 transition-all flex items-center gap-3"
        >
          <Sparkles size={16} />
          View Brand Kit
          <ArrowRight size={16} />
        </Link>

        <Link
          href="/"
          className="font-serif text-sm text-foreground/40 hover:text-foreground/60 transition"
        >
          ← Back to stagename.club
        </Link>
      </div>
    </div>
  );
}
