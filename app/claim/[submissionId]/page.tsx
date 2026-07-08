"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Sparkles, Loader2, ArrowRight, Lock } from "lucide-react";

interface ClaimData {
  submissionId: string;
  status: string;
  email?: string;
}

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClaimData | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!submissionId) return;

    fetch(`/api/claim/${submissionId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          if (json.status === "complete" && json.brandKitSlug) {
            router.push(`/brand-kit/${json.brandKitSlug}`);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load submission");
        setLoading(false);
      });
  }, [submissionId, router]);

  const handlePay = async () => {
    if (!data?.email) return;
    setPaying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, email: data.email }),
      });

      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setPaying(false);
        setError("Failed to create checkout session");
      }
    } catch {
      setPaying(false);
      setError("Payment error — please try again");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader2 size={32} className="text-pink-accent ai-spinner" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-foreground/60">{error}</p>
        <Link href="/" className="text-sm font-serif text-pink-accent hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige text-foreground flex flex-col">
      <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Star size={14} className="text-foreground" />
            <span className="text-lg font-serif lowercase tracking-wide">
              stagename.club
            </span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-pink-accent/10 text-pink-accent rounded-full px-4 py-1.5 text-xs font-serif uppercase tracking-wider mb-6">
              <Lock size={12} />
              Your Kit is Locked
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold mb-3">
              We found 3 available identities for you
            </h1>
            <p className="font-serif text-foreground/50 text-sm leading-relaxed">
              Our AI analyzed your vibe, your look, and cross-referenced global
              platform availability. Your personalized Brand Kit is ready to
              unlock.
            </p>
          </div>

          <div className="bg-white/60 border border-foreground/10 rounded-2xl p-6 mb-8">
            <p className="font-serif text-xs text-foreground/40 uppercase tracking-wider mb-4">
              What&apos;s included
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "✨", label: "3 AI-generated stage names with reasons" },
                { icon: "🎨", label: "Custom studio portrait + logo" },
                { icon: "🔍", label: "Platform availability report" },
                { icon: "📄", label: "Downloadable Brand Kit PDF" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-serif text-sm text-foreground/70">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="processing-blur flex flex-col gap-3 mb-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white/60 border border-foreground/10 rounded-xl p-4"
              >
                <p className="font-serif text-lg font-semibold text-foreground">
                  Identity {n}
                </p>
                <p className="font-serif text-xs text-foreground/50">
                  AI-generated reason for this name...
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handlePay}
            disabled={paying || !data?.email}
            className={`w-full rounded-full px-8 py-4 text-white font-serif uppercase tracking-wider text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              paying
                ? "opacity-70 cursor-not-allowed holographic"
                : "holographic holographic-shadow hover:scale-[1.02]"
            }`}
          >
            {paying ? (
              <>
                <Loader2 size={16} className="ai-spinner" />
                Redirecting to Payment...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Pay $14.99 to Reveal My Kit
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {error && (
            <p className="text-center text-xs font-serif text-red-500 mt-4">
              {error}
            </p>
          )}

          <p className="text-center font-serif text-xs text-foreground/30 mt-6">
            Secure payment via Stripe. One-time charge. Instant delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
