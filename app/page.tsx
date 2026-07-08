"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Star } from "lucide-react";

export default function Home() {
  const [artistName, setArtistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nameBubbles = ["Echo", "Nova", "Muse", "Riff", "Aura", "Vibe", "Flux", "Drift", "Pulse", "Shade"];

  return (
    <div className="min-h-screen bg-beige text-foreground overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-foreground" />
            <span className="text-lg font-serif lowercase tracking-wide">stagename.club</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-foreground/70 font-serif">
            <Link href="#how" className="hover:text-foreground transition">How it Works</Link>
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <span className="hover:text-foreground transition cursor-pointer">Blog</span>
            <span className="hover:text-foreground transition cursor-pointer">Log In</span>
          </div>
          <Link
            href="/quiz"
            className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300"
          >
            Get My Name
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-12">
        {/* Headline: YOUR PERFECT ARTIST NAME IS WAITING */}
        <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight mb-4">
          <span className="uppercase tracking-wider">YOUR </span>
          <span className="font-script text-pink-accent text-5xl sm:text-6xl lg:text-7xl lowercase">perfect</span>
          <span className="uppercase tracking-wider"> ARTIST NAME IS </span>
          <span className="font-script text-pink-accent text-5xl sm:text-6xl lg:text-7xl lowercase">waiting</span>
        </h1>
        <p className="text-center text-lg text-foreground/60 font-serif mb-8 max-w-xl mx-auto">
          Stop struggling with your identity. Start building your legacy.
        </p>

        {/* Input Field + Button */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="e.g., Dimitri..."
            className="w-64 sm:w-80 rounded-full border-2 border-foreground/20 bg-white px-6 py-3 text-foreground font-serif placeholder:text-foreground/40 focus:outline-none focus:border-pink-accent/50 transition"
          />
          <Link
            href="/quiz"
            className="holographic-shadow rounded-full px-6 py-3 text-white font-serif uppercase tracking-wider text-sm font-bold holographic transition-all duration-300 hover:scale-105"
          >
            FIND MY STAGE NAME
          </Link>
        </div>

        {/* ===== BEFORE / AFTER SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4 lg:gap-0">
          {/* LEFT — BEFORE: dimitri */}
          <div className="relative bg-white/60 border border-foreground/10 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="absolute top-4 left-6">
              <span className="text-xs font-serif uppercase tracking-[0.4em] text-foreground/40">BEFORE:</span>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              {/* Status */}
              <div className="text-center">
                <span className="text-sm font-serif text-foreground/50 italic">Undiscovered</span>
                <div className="text-3xl font-serif text-foreground/30 font-bold">0</div>
              </div>

              {/* Artist avatar — frustrated */}
              <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-beige-dark to-white border-2 border-foreground/15 flex items-center justify-center">
                {/* Singer illustration placeholder */}
                <svg viewBox="0 0 80 80" className="w-24 h-24 text-foreground/40">
                  <circle cx="40" cy="28" r="14" fill="currentColor" />
                  <path d="M24 58c0-10 7-18 16-18s16 8 16 18" fill="currentColor" />
                  <rect x="38" y="42" width="4" height="20" rx="2" fill="currentColor" />
                  <circle cx="38" cy="62" r="6" fill="currentColor" />
                </svg>
              </div>

              {/* Speech bubble — dimitri */}
              <div className="relative bg-white border border-foreground/15 rounded-2xl px-4 py-2 shadow-sm">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-foreground/15 rotate-45" />
                <span className="text-lg font-serif text-foreground/50 lowercase">dimitri</span>
              </div>

              {/* Name caption */}
              <div className="text-center">
                <span className="text-xl font-serif uppercase tracking-wider text-foreground/70">DIMITRI</span>
                <span className="text-xs font-serif text-foreground/40 block">(Real Name)</span>
              </div>

              {/* Data streams flowing right */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-8 rounded-full data-stream ${
                      i % 3 === 0 ? "bg-pink-accent/30" : i % 3 === 1 ? "bg-cyan-accent/30" : "bg-purple-400/30"
                    }`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CENTER — Heart Processor + "FIND MY NAME" */}
          <div className="flex flex-col items-center gap-3 py-4 lg:py-0 lg:px-2">
            {/* Data streams entering */}
            <div className="flex gap-1 rotate-90 lg:rotate-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`in-${i}`}
                  className={`w-1 h-6 rounded-full data-stream ${
                    i % 2 === 0 ? "bg-pink-accent/50" : "bg-cyan-accent/50"
                  }`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>

            {/* Heart CTA device */}
            <Link
              href="/quiz"
              className="heart-pulse relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl holographic holographic-shadow flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110"
            >
              <Heart size={28} className="text-white fill-white" />
              <span className="text-xs text-white font-serif uppercase tracking-wider">Find My Name</span>
            </Link>

            {/* Data streams exiting */}
            <div className="flex gap-1 rotate-90 lg:rotate-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`out-${i}`}
                  className={`w-1 h-6 rounded-full data-stream ${
                    i % 2 === 0 ? "bg-cyan-accent/50" : "bg-pink-accent/50"
                  }`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — AFTER: Prense */}
          <div className="relative bg-white/60 border border-foreground/10 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="absolute top-4 right-6">
              <span className="text-xs font-serif uppercase tracking-[0.4em] text-pink-accent">AFTER:</span>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              {/* Status + Metrics */}
              <div className="text-center">
                <span className="text-sm font-serif holographic-text font-bold italic">Unstoppable</span>
              </div>

              {/* Social metrics */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.56-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-2.04-8.159-2.64-11.939-1.44-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.26-1.26 9.54-.66 13.2 1.56.479.301.659.84.36 1.26zm.66-3.54c-3.6-2.16-9.54-2.34-13.26-1.26-.6.18-1.2-.18-1.38-.78-.18-.6.18-1.2.78-1.38 4.32-1.32 10.8-1.08 14.94 1.32.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.5.3z"/>
                  </svg>
                  <span className="text-xs font-serif holographic-text font-bold">56k</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-accent" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  <span className="text-xs font-serif holographic-text font-bold">94k</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.76-1.35 3.91-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.79.57-1.33 1.46-1.41 2.39-.07.89.16 1.83.75 2.53.63.75 1.59 1.17 2.53 1.14.97-.03 1.89-.49 2.49-1.23.43-.56.65-1.26.67-1.97.04-2.92.01-5.84.02-8.76.01-1.76.67-3.49 1.76-4.83C10.18.98 11.37.42 12.52.02z"/>
                  </svg>
                  <span className="text-xs font-serif holographic-text font-bold">160k</span>
                </div>
              </div>

              {/* Artist avatar — happy with holographic aura */}
              <div className="relative">
                {/* Holographic glow aura */}
                <div className="absolute inset-0 rounded-full aura-glow" />
                <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-beige-dark to-white border-2 border-pink-accent/30 flex items-center justify-center overflow-hidden">
                  {/* Holographic overlay */}
                  <div className="absolute inset-0 holographic opacity-10 rounded-full" />
                  {/* Singer illustration placeholder */}
                  <svg viewBox="0 0 80 80" className="w-24 h-24 text-pink-accent">
                    <circle cx="40" cy="28" r="14" fill="currentColor" />
                    <path d="M24 58c0-10 7-18 16-18s16 8 16 18" fill="currentColor" />
                    <rect x="38" y="42" width="4" height="20" rx="2" fill="currentColor" />
                    <circle cx="38" cy="62" r="6" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Speech bubble — Prense */}
              <div className="relative holographic-shadow bg-white rounded-2xl px-4 py-2">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-pink-accent/30 rotate-45" />
                <span className="text-lg font-serif holographic-text font-bold lowercase">Prense</span>
              </div>

              {/* Name caption */}
              <div className="text-center">
                <span className="text-xl font-serif uppercase tracking-wider holographic-text font-bold">PRENSE</span>
                <span className="text-xs font-serif text-foreground/40 block">(New Stage Name)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES — Three Columns ===== */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Tell Us Who You Are */}
          <div className="bg-white/60 border border-foreground/10 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl holographic/10 bg-beige-dark flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-pink-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <circle cx="8" cy="15" r="2" />
                <path d="M13 13h4M13 15h4M13 17h2" />
              </svg>
            </div>
            <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-foreground/70 mb-2">TELL US WHO YOU ARE</h3>
            <p className="text-sm font-serif text-foreground/50">Tell us about your sound and your story.</p>
          </div>

          {/* Our Algorithms Work */}
          <div className="bg-white/60 border border-foreground/10 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-beige-dark flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <path d="M12 8c-2 0-3 2-3 3s1 3 3 3 3-2 3-3-1-3-3-3z" />
                <path d="M9 6L8 4M15 6l1-2M9 14l-1 2M15 14l1 2" />
              </svg>
            </div>
            <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-foreground/70 mb-2">OUR ALGORITHMS WORK</h3>
            <p className="text-sm font-serif text-foreground/50">We analyze millions of names and meanings.</p>
          </div>

          {/* Claim Your New Identity */}
          <div className="bg-white/60 border border-foreground/10 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-beige-dark flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-pink-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="5" />
                <path d="M7 18c0-3 2-5 5-5s5 2 5 5" />
                <circle cx="18" cy="5" r="1.5" fill="currentColor" />
                <circle cx="6" cy="5" r="1.5" fill="currentColor" />
                <circle cx="16" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-foreground/70 mb-2">CLAIM YOUR NEW IDENTITY</h3>
            <p className="text-sm font-serif text-foreground/50">Secure your name and dominate the charts.</p>
          </div>
        </div>
      </section>

      {/* ===== PRICING / CTA SECTION ===== */}
      <section className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="relative bg-white/60 border border-foreground/10 rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-wider">
              Unlock Your <span className="font-script text-pink-accent lowercase text-3xl sm:text-4xl">Complete Brand Dossier</span>
            </h2>
            <p className="text-sm font-serif text-foreground/50 mt-2 max-w-lg mx-auto">
              Get 50+ personalized brand names, cultural analysis, and sonic branding guidelines
            </p>
          </div>

          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-4xl font-serif font-bold holographic-text">$14.99</span>
            <span className="text-sm font-serif text-foreground/40">one-time</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full max-w-md mx-auto holographic holographic-shadow rounded-full py-3 text-white font-serif uppercase tracking-wider text-sm font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </button>

          <p className="text-xs text-foreground/40 text-center mt-4 font-serif">
            Secure payment via Stripe. No hidden fees.
          </p>
        </div>
      </section>

      {/* ===== TRUST INDICATORS ===== */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-foreground/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-serif font-bold holographic-text">14,204+</div>
            <div className="text-xs font-serif text-foreground/50 uppercase tracking-wider">Artists Rebranded</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold holographic-text">98%</div>
            <div className="text-xs font-serif text-foreground/50 uppercase tracking-wider">Match Rate</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold">⭐⭐⭐⭐⭐</div>
            <div className="text-xs font-serif text-foreground/50 uppercase tracking-wider">5-Star Rating</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold holographic-text">2M+</div>
            <div className="text-xs font-serif text-foreground/50 uppercase tracking-wider">Names Generated</div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-foreground/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Links */}
          <div className="flex flex-wrap gap-4 text-sm font-serif text-foreground/50">
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
            <Link href="/refund" className="hover:text-foreground transition">Refund Policy</Link>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.56-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-2.04-8.159-2.64-11.939-1.44-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.26-1.26 9.54-.66 13.2 1.56.479.301.659.84.36 1.26zm.66-3.54c-3.6-2.16-9.54-2.34-13.26-1.26-.6.18-1.2-.18-1.38-.78-.18-.6.18-1.2.78-1.38 4.32-1.32 10.8-1.08 14.94 1.32.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.5.3z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-pink-accent" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.76-1.35 3.91-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.79.57-1.33 1.46-1.41 2.39-.07.89.16 1.83.75 2.53.63.75 1.59 1.17 2.53 1.14.97-.03 1.89-.49 2.49-1.23.43-.56.65-1.26.67-1.97.04-2.92.01-5.84.02-8.76.01-1.76.67-3.49 1.76-4.83C10.18.98 11.37.42 12.52.02z"/>
            </svg>
          </div>

          {/* Join the Club button */}
          <Link
            href="/quiz"
            className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300"
          >
            JOIN THE CLUB
          </Link>
        </div>
      </footer>
    </div>
  );
}
