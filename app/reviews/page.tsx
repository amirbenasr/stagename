import Link from "next/link";
import type { Metadata } from "next";
import Logo from "../components/Logo";
import { ArrowRight, Star } from "lucide-react";
import { reviewRepository } from "../../lib/repositories/review-repository";
import type { Review } from "../../lib/types";

export const metadata: Metadata = {
  title: "Reviews | StageName Club",
  description: "See what other artists say about StageName Club.",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          className={index < rating ? "text-pink-accent fill-pink-accent" : "text-foreground/20"}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews: Review[] = await reviewRepository.findAll();
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-beige text-foreground">
      <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo className="h-10 w-auto" showTagline={false} />
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-foreground/70 font-serif">
            <Link href="/" className="hover:text-foreground transition">Home</Link>
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/reviews" className="hover:text-foreground transition">Reviews</Link>
          </div>
          <Link
            href="/quiz"
            className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300"
          >
            See My Artist Self
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <p className="mb-4 text-sm font-serif uppercase tracking-[0.3em] text-coral">Artist reviews</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold uppercase tracking-wider text-foreground">
            Real feedback from artists who built their identity.
          </h1>
          <p className="mt-4 text-lg font-serif text-foreground/50 max-w-2xl mx-auto">
            Read reviews from creators who used StageName Club to launch their stage persona.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white/60 border border-foreground/10 p-8 sm:p-10 shadow-lg mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-serif text-foreground/50">Verified artist reviews</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-foreground/50">Average rating {averageRating.toFixed(1)} / 5</p>
            </div>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-pink-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-pink-accent/90 transition"
            >
              Start your brand kit
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <section className="grid gap-6">
          {reviews.length === 0 ? (
            <div className="rounded-[2rem] bg-white/60 border border-foreground/10 p-12 shadow-lg text-center">
              <p className="text-lg font-semibold text-foreground mb-3">No reviews yet.</p>
              <p className="text-sm text-foreground/60 mb-6">
                Be the first artist to share feedback about your brand kit.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-full bg-pink-accent text-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-pink-accent/90 transition"
              >
                Take the quiz
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[2rem] bg-white/90 border border-foreground/10 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Artist review</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{review.maskedEmail}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <RatingStars rating={review.rating} />
                    <p className="text-sm text-foreground/50">{formatDate(review.createdAt)}</p>
                  </div>
                </div>

                <p className="text-base leading-relaxed text-foreground/80 mb-6">{review.comment}</p>

                <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/50">
                  <span>Brand kit:</span>
                  <Link
                    href={`/brand-kit/${review.brandKitSlug}`}
                    className="text-foreground hover:text-pink-accent transition"
                  >
                    {review.brandKitSlug}
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-foreground/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 text-sm font-serif text-foreground/50">
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
            <Link href="/refund" className="hover:text-foreground transition">Refund Policy</Link>
          </div>
          <Link
            href="/quiz"
            className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300"
          >
            SEE MY ARTIST SELF
          </Link>
        </div>
      </footer>
    </div>
  );
}
