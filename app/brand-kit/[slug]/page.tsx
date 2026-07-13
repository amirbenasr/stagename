"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Loader2,
  ArrowLeft,
  Check,
  X,
  Star,
  RefreshCw,
} from "lucide-react";
import Logo from "../../components/Logo";
import SpeakButton from "../../components/SpeakButton";
import type { BrandKitData, NameAssetSet } from "../../../lib/types";
import { PLATFORM_LABELS } from "../../../lib/types";

export default function BrandKitPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [brandKit, setBrandKit] = useState<BrandKitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const pollRef = useRef(0);

  useEffect(() => {
    if (!slug) {
      setError("Invalid brand kit link.");
      setLoading(false);
      return;
    }

    const fetchBrandKit = async () => {
      try {
        const res = await fetch(`/api/brand-kit/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Brand kit not found. Check your link and try again.");
          } else {
            setError("Failed to load brand kit. Please try again later.");
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBrandKit(data);
        setLoading(false);
      } catch {
        setError("Failed to load brand kit. Please try again later.");
        setLoading(false);
      }
    };

    fetchBrandKit();
  }, [slug]);

  // Poll for generation status if brand kit exists but has no names yet
  useEffect(() => {
    if (!slug || loading || brandKit?.names.length) return;

    const interval = setInterval(async () => {
      pollRef.current += 1;
      if (pollRef.current > 60) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/brand-kit/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.names?.length > 0) {
            setBrandKit(data);
            clearInterval(interval);
          }
        }
      } catch {
        // silent
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slug, loading, brandKit?.names?.length]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handlePreview = (url: string, label: string) => {
    setPreviewImage({ url, label });
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-pink-accent ai-spinner" />
          <p className="font-serif text-foreground/60">
            Loading your brand kit...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Oops!
          </h1>
          <p className="font-serif text-foreground/60 mb-8">{error}</p>
          <Link
            href="/"
            className="holographic holographic-shadow rounded-full px-6 py-3 text-white font-serif uppercase tracking-wider text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Star size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!brandKit) return null;

  // Show generating state
  if (!brandKit.names?.length) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <Loader2 size={40} className="text-pink-accent ai-spinner mx-auto mb-6" />
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-3">
            Generating Your Brand Kit
          </h1>
          <p className="font-serif text-foreground/60 mb-6">
            Our AI is crafting 3 stage names, each with a custom logo, portrait, and studio photo.
            This can take a few minutes.
          </p>
          <p className="font-serif text-sm text-foreground/40 mb-6">
            You&apos;ll also receive an email once everything is ready. Feel free to close this tab and check your inbox later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 mx-auto px-5 py-2 rounded-full border border-foreground/20 font-serif text-sm text-foreground/60 hover:border-foreground hover:text-foreground transition-all"
          >
            <RefreshCw size={14} />
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige text-foreground flex flex-col">
      {/* ===== NAVBAR ===== */}
      <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="block">
            <Logo className="h-8 w-auto" showTagline={false} />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground/20 font-serif text-sm uppercase tracking-wider text-foreground/60 hover:border-foreground hover:text-foreground transition-all duration-300"
            >
              <Download size={14} />
              Download PDF
            </button>
          </div>
        </div>
      </nav>

      {/* ===== PRINT HEADER ===== */}
      <div className="hidden print:block print:mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold">stagename.club</h1>
          <p className="text-sm font-serif text-gray-500 mt-2">
            Artist Debut Brand Kit
          </p>
          <p className="text-xs font-serif text-gray-400 mt-1">
            Generated:{" "}
            {brandKit.createdAt
              ? new Date(brandKit.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 print:pt-0 print:pb-4">
        <div className="text-center">
          <p className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-4 print:hidden">
            Your Artist Debut Kit
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Three Names. Nine Assets.{" "}
            <span className="holographic-text">Your Launch.</span>
          </h1>
          <p className="font-serif text-foreground/50 max-w-md mx-auto">
            Each stage name comes with its own studio portrait, logo, and platform availability report.
          </p>
          {(brandKit.genre || brandKit.vibe) && (
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              {brandKit.genre && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 border border-foreground/10 px-4 py-1.5 text-xs font-serif text-foreground/70">
                  🎵 {brandKit.genre}
                </span>
              )}
              {brandKit.vibe && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 border border-foreground/10 px-4 py-1.5 text-xs font-serif text-foreground/70">
                  ✨ {brandKit.vibe}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== NAME OVERVIEW CARDS ===== */}
      <div className="max-w-5xl mx-auto px-6 pb-8 print:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brandKit.names.map((nameData, i) => (
            <a
              key={i}
              href={`#name-${i}`}
              className={`group text-left rounded-3xl border p-5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-accent/40 ${
                i === 0
                  ? "border-pink-accent/30 bg-pink-accent/5 shadow-[0_20px_60px_-28px_rgba(236,72,153,0.6)]"
                  : "border-foreground/10 bg-white/70 hover:border-pink-accent/20 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif font-bold text-white bg-foreground/90">
                  {i + 1}
                </span>
                {i === 0 && (
                  <span className="rounded-full bg-pink-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-pink-accent">
                    Top Pick
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-serif text-lg font-semibold text-foreground group-hover:text-pink-accent">
                  {nameData.name}
                </p>
                <SpeakButton text={nameData.name} size={14} />
              </div>
              <p className="text-sm font-serif leading-relaxed text-foreground/60 line-clamp-3">
                {nameData.reason}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* ===== VERTICAL SECTIONS — One per name ===== */}
      {brandKit.names.map((nameData, nameIndex) => (
        <NameSection
          key={nameIndex}
          nameData={nameData}
          index={nameIndex}
          onPreview={handlePreview}
        />
      ))}

      {/* ===== FOOTER ===== */}
      <div className="max-w-5xl mx-auto px-6 py-12 print:hidden">
        <div className="border-t border-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-sm text-foreground/50 hover:text-foreground transition"
          >
            <ArrowLeft size={14} />
            Back to stagename.club
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="holographic holographic-shadow rounded-full px-6 py-3 text-white font-serif uppercase tracking-wider text-sm font-bold hover:scale-105 transition-all flex items-center gap-2"
          >
            <Download size={14} />
            Download as PDF
          </button>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-neutral-950 shadow-2xl">
            <button
              onClick={closePreview}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white transition hover:bg-black/70"
            >
              <X size={18} />
            </button>
            <div className="px-6 py-5 border-b border-white/10">
              <p className="text-sm font-serif uppercase tracking-[0.3em] text-white/60">
                Preview
              </p>
              <h2 className="mt-2 text-2xl font-serif font-bold text-white">
                {previewImage.label}
              </h2>
            </div>
            <div className="aspect-[16/9] relative bg-black">
              <Image
                src={previewImage.url}
                alt={previewImage.label}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== PRINT FOOTER ===== */}
      <div className="hidden print:block print:mt-8 print:text-center print:text-xs print:text-gray-400">
        <p>stagename.club — Artist Debut Brand Kit</p>
        <p>Unique link: stagename.club/brand-kit/{slug}</p>
      </div>
    </div>
  );
}

// ============================================================
// NameSection — Vertical section for each name
// ============================================================

function NameSection({
  nameData,
  index,
  onPreview,
}: {
  nameData: NameAssetSet;
  index: number;
  onPreview: (url: string, label: string) => void;
}) {
  return (
    <div
      id={`name-${index}`}
      className="max-w-5xl mx-auto px-6 pb-8 scroll-mt-20"
    >
      <div className="rounded-[2rem] bg-white/70 border border-foreground/10 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.12)]">
        {/* Name Header */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-base font-serif font-bold text-white bg-foreground/90">
              {index + 1}
            </span>
            {index === 0 && (
              <span className="rounded-full bg-pink-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-pink-accent">
                Top Pick
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              {nameData.name}
            </h2>
            <SpeakButton text={nameData.name} size={20} />
          </div>
          <p className="text-sm font-serif text-foreground/60 leading-relaxed max-w-2xl">
            {nameData.reason}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Studio Photo */}
          <button
            type="button"
            onClick={() => onPreview(nameData.studioPhotoUrl, `Studio — ${nameData.name}`)}
            className="group overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 transition-all hover:border-pink-accent/30"
          >
            <div className="aspect-[4/3] relative">
              {nameData.studioPhotoUrl ? (
                <Image
                  src={nameData.studioPhotoUrl}
                  alt="Studio shot"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                  <Loader2 size={24} className="text-foreground/30 animate-spin" />
                </div>
              )}
            </div>
            <div className="p-3 text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Studio</p>
              <p className="text-xs font-serif font-semibold text-foreground">Showcase photo</p>
            </div>
          </button>

          {/* Portrait */}
          <button
            type="button"
            onClick={() => onPreview(nameData.portraitImageUrl, `Portrait — ${nameData.name}`)}
            className="group overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 transition-all hover:border-pink-accent/30"
          >
            <div className="aspect-[4/5] relative">
              {nameData.portraitImageUrl ? (
                <Image
                  src={nameData.portraitImageUrl}
                  alt="Portrait shot"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                  <Loader2 size={24} className="text-foreground/30 animate-spin" />
                </div>
              )}
            </div>
            <div className="p-3 text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Portrait</p>
              <p className="text-xs font-serif font-semibold text-foreground">Artist portrait</p>
            </div>
          </button>

          {/* Logo */}
          <button
            type="button"
            onClick={() => onPreview(nameData.logoImageUrl, `Logo — ${nameData.name}`)}
            className="group overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 transition-all hover:border-pink-accent/30"
          >
            <div className="aspect-square relative">
              {nameData.logoImageUrl ? (
                <Image
                  src={nameData.logoImageUrl}
                  alt="Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                  <Loader2 size={24} className="text-foreground/30 animate-spin" />
                </div>
              )}
            </div>
            <div className="p-3 text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40">Logo</p>
              <p className="text-xs font-serif font-semibold text-foreground">Brand mark</p>
            </div>
          </button>
        </div>

        {/* Availability */}
        <div className="rounded-[1.75rem] bg-foreground/5 p-6">
          <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-pink-accent mb-4">
            Platform Availability — {nameData.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(PLATFORM_LABELS).map(([key, { label, icon }]) => {
              const platform = nameData.availability[key as keyof NameAssetSet["availability"]];
              if (!platform) return null;

              return (
                <div
                  key={key}
                  className={`rounded-xl p-3 border text-center ${
                    platform.available
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <p className="font-serif text-xs font-semibold text-foreground mt-1">
                    {label}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {platform.available ? (
                      <>
                        <Check size={10} className="text-green-600" />
                        <span className="text-[10px] font-serif text-green-600">
                          Available
                        </span>
                      </>
                    ) : (
                      <>
                        <X size={10} className="text-red-500" />
                        <span className="text-[10px] font-serif text-red-500">
                          Taken
                        </span>
                      </>
                    )}
                  </div>
                  {platform.available && platform.handle && (
                    <p className="text-[9px] font-serif text-foreground/40 mt-1 truncate">
                      {platform.handle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
