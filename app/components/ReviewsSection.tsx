"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import type { Review } from "../../lib/types";

interface ReviewsSectionProps {
  brandKitSlug: string;
}

export default function ReviewsSection({ brandKitSlug }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?slug=${brandKitSlug}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [brandKitSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !rating || !comment.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandKitSlug,
          email: email.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit review");
        return;
      }

      if (data.review) {
        setReviews((prev) => [data.review, ...prev]);
      }
      try {
        if ((window as any).rdt) {
          (window as any).rdt("track", "ReviewSubmit", {
            brandKitSlug,
            rating,
          });
        }
      } catch (_) {
        // ignore
        console.log("ERROR");
        
      }
      setSubmitted(true);
      setShowForm(false);
      setEmail("");
      setRating(0);
      setComment("");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 print:hidden">
      <div className="rounded-[2rem] bg-white/70 border border-foreground/10 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={18} className="text-pink-accent" />
              <h2 className="text-xl font-serif font-bold text-foreground">
                Reviews
              </h2>
            </div>
            {reviews.length > 0 && (
              <p className="text-sm font-serif text-foreground/50">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""} · Avg{" "}
                {avgRating.toFixed(1)}{" "}
                <Star
                  size={12}
                  className="inline text-pink-accent fill-pink-accent -mt-0.5"
                />
              </p>
            )}
          </div>
          {!submitted && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground/20 font-serif text-sm uppercase tracking-wider text-foreground/60 hover:border-pink-accent hover:text-pink-accent transition-all duration-300"
            >
              <Star size={14} />
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showForm && !submitted && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl bg-foreground/5 border border-foreground/10 p-6"
          >
            <div className="mb-4">
              <label className="block text-xs font-serif uppercase tracking-[0.2em] text-foreground/50 mb-2">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-foreground/15 bg-white px-4 py-2.5 font-serif text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-pink-accent/50 focus:ring-1 focus:ring-pink-accent/20 transition-all"
              />
              <p className="mt-1 text-[10px] font-serif text-foreground/40">
                Your email will be masked publicly (e.g. a***z@example.com)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-serif uppercase tracking-[0.2em] text-foreground/50 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={`${
                        star <= (hoverRating || rating)
                          ? "text-pink-accent fill-pink-accent"
                          : "text-foreground/20"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-serif uppercase tracking-[0.2em] text-foreground/50 mb-2">
                Your Review
              </label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What do you think of this brand kit?"
                rows={3}
                className="w-full rounded-xl border border-foreground/15 bg-white px-4 py-2.5 font-serif text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-pink-accent/50 focus:ring-1 focus:ring-pink-accent/20 transition-all resize-none"
              />
            </div>

            {submitError && (
              <p className="mb-3 text-sm font-serif text-red-500">{submitError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !email || !rating || !comment.trim()}
                className="holographic holographic-shadow rounded-full px-5 py-2 text-white font-serif uppercase tracking-wider text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSubmitError(null);
                }}
                className="font-serif text-sm text-foreground/50 hover:text-foreground transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-pink-accent animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-foreground/15 mb-3" />
            <p className="font-serif text-foreground/40 text-sm">
              No reviews yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl bg-foreground/[0.03] border border-foreground/8 p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-sm font-semibold text-foreground/70">
                    {review.maskedEmail}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={`${
                          star <= review.rating
                            ? "text-pink-accent fill-pink-accent"
                            : "text-foreground/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="font-serif text-sm text-foreground/60 leading-relaxed">
                  {review.comment}
                </p>
                <p className="mt-2 text-[10px] font-serif text-foreground/30">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
