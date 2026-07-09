"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Eye,
  Loader2,
  ArrowLeft,
  Check,
  X,
  Globe,
  Star,
} from "lucide-react";
import Logo from "../../components/Logo";
import type { BrandKitData, NameAvailability } from "../../../lib/types";
import { PLATFORM_LABELS } from "../../../lib/types";

export default function BrandKitPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [brandKit, setBrandKit] = useState<BrandKitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNameIndex, setSelectedNameIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    label: string;
  } | null>(null);

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

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleNameClick = (index: number) => {
    setSelectedNameIndex(index);
    const anchor = document.getElementById(`name-${index}`);
    anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            Meet{" "}
            <span className="holographic-text">
              {brandKit.stageNames[0]?.name || "Your Artist"}
            </span>
          </h1>
          <p className="font-serif text-foreground/50 max-w-md mx-auto">
            Three AI-crafted stage names, a studio portrait, logo, and platform
            availability report — your brand identity, ready to launch.
          </p>
        </div>
      </div>

      {/* ===== OVERVIEW ===== */}
      <div className="max-w-5xl mx-auto px-6 py-8 print:py-4">
        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_0.6fr] gap-8">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white/70 border border-foreground/10 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              <p className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-3 print:text-gray-500">
                Artist Debut Brand Kit
              </p>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-3">
                {brandKit.stageNames[0]?.name || "Your Artist"}
              </h1>
              <p className="text-sm font-serif text-foreground/60 max-w-2xl">
                A refined launch kit with three stage name concepts, visual assets, and platform availability so you can start building your identity immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brandKit.stageNames.map((sn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleNameClick(i)}
                  className={`group text-left rounded-3xl border p-5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-accent/40 ${
                    selectedNameIndex === i
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
                  <p className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-pink-accent">
                    {sn.name}
                  </p>
                  <p className="text-sm font-serif leading-relaxed text-foreground/60 line-clamp-4">
                    {sn.reason}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-6 rounded-[2rem] bg-white/70 border border-foreground/10 p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.12)]">
            <div>
              <p className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-3">
                Highlight
              </p>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                {brandKit.stageNames[selectedNameIndex]?.name}
              </h2>
              <p className="text-sm font-serif text-foreground/60">
                Select any generated name above to reveal its visuals and availability in the kit below.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-foreground/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Logo</p>
                <p className="text-base font-semibold text-foreground mt-2">Visual mark for brand identity</p>
              </div>
              <div className="rounded-3xl bg-foreground/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Portrait</p>
                <p className="text-base font-semibold text-foreground mt-2">Character imagery for socials</p>
              </div>
              <div className="rounded-3xl bg-foreground/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Studio shoot</p>
                <p className="text-base font-semibold text-foreground mt-2">Showcase-ready photography</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ===== NAME DETAIL + GALLERY ===== */}
      <div className="max-w-5xl mx-auto px-6 pb-8 print:pb-4">
        <div
          id={`name-${selectedNameIndex}`}
          className="grid grid-cols-1 lg:grid-cols-[0.9fr_0.6fr] gap-8 rounded-[2rem] bg-white/70 border border-foreground/10 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.12)]"
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent">
                Why we chose this name
              </span>
              <h2 className="text-3xl font-serif font-bold text-foreground">
                {brandKit.stageNames[selectedNameIndex]?.name}
              </h2>
              <p className="text-sm font-serif text-foreground/60 leading-relaxed">
                {brandKit.stageNames[selectedNameIndex]?.reason}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                Cover photos
              </span>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <button
                    key={`cover-${index}`}
                    type="button"
                    onClick={() => handlePreview(brandKit.studioPhotoUrl, "Studio Session")}
                    className="overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 transition-all hover:border-pink-accent/30"
                  >
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={brandKit.studioPhotoUrl}
                        alt="Studio shot"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                Studio session photos
              </span>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <button
                    key={`session-${index}`}
                    type="button"
                    onClick={() => handlePreview(brandKit.portraitImageUrl, "Portrait")}
                    className="overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 transition-all hover:border-pink-accent/30"
                  >
                    <div className="aspect-[4/5] relative">
                      <Image
                        src={brandKit.portraitImageUrl}
                        alt="Portrait shot"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 rounded-[2rem] bg-foreground/5 p-6">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-foreground/10">
              <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-pink-accent mb-3">
                Availability
              </h3>
              <div className="space-y-3">
                {Object.entries(PLATFORM_LABELS).map(([key, { label, icon }]) => {
                  const status = brandKit.availability[brandKit.stageNames[selectedNameIndex]?.name]?.[key as keyof NameAvailability];
                  return (
                    <div key={key} className="flex items-center justify-between rounded-3xl border border-foreground/10 bg-foreground/10 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          {status?.available && status.handle ? (
                            <p className="text-[11px] text-foreground/60">{status.handle}</p>
                          ) : null}
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status?.available ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>
                        {status?.available ? "Available" : "Taken"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-foreground/10">
              <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-pink-accent mb-3">
                Metrics
              </h3>
              <ul className="space-y-2 text-sm font-serif text-foreground/70">
                <li>Memorable and unique</li>
                <li>Brand-ready for social impact</li>
                <li>Easy to spell, search, and say</li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-foreground/10">
              <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-pink-accent mb-3">
                Music Style
              </h3>
              <p className="text-sm font-serif text-foreground/70 leading-relaxed">
                A look and feel built to match your artist personality, stage presence, and melodic vibe.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ===== FULL IMAGE GALLERY ===== */}
      <div className="max-w-5xl mx-auto px-6 pb-8 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => handlePreview(brandKit.studioPhotoUrl, "Studio Photo")}
            className="group overflow-hidden rounded-[2rem] border border-foreground/10 bg-white/70 transition-all hover:border-pink-accent/30 hover:shadow-xl"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={brandKit.studioPhotoUrl}
                alt="Studio photo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-2">
                Studio Photo
              </p>
              <p className="font-serif text-lg font-semibold text-foreground">Full gallery view</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePreview(brandKit.portraitImageUrl, "Portrait")}
            className="group overflow-hidden rounded-[2rem] border border-foreground/10 bg-white/70 transition-all hover:border-pink-accent/30 hover:shadow-xl"
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={brandKit.portraitImageUrl}
                alt="Portrait photo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-2">
                Portrait
              </p>
              <p className="font-serif text-lg font-semibold text-foreground">Open full preview</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePreview(brandKit.logoImageUrl, "Logo")}
            className="group overflow-hidden rounded-[2rem] border border-foreground/10 bg-white/70 transition-all hover:border-pink-accent/30 hover:shadow-xl"
          >
            <div className="aspect-square relative">
              <Image
                src={brandKit.logoImageUrl}
                alt="Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-2">
                Logo
              </p>
              <p className="font-serif text-lg font-semibold text-foreground">Brand mark preview</p>
            </div>
          </button>
        </div>
      </div>

      {/* ===== PLATFORM AVAILABILITY ===== */}
      {brandKit.studioPhotoUrl && (
        <div className="max-w-4xl mx-auto px-6 py-8 print:py-4">
          <h2 className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-6 print:text-gray-500">
            Your Studio Portrait
          </h2>
          <div className="bg-white/60 border border-foreground/10 rounded-2xl overflow-hidden print:border print:border-gray-300">
            <div className="aspect-video relative">
              <Image
                src={brandKit.studioPhotoUrl}
                alt={`Studio portrait for ${brandKit.stageNames[0]?.name}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="px-4 py-3 border-t border-foreground/10 print:border-t print:border-gray-300">
              <p className="font-serif text-xs uppercase tracking-wider text-foreground/40 print:text-gray-500">
                Artist Studio Session
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== PORTRAIT + LOGO ===== */}
      <div className="max-w-4xl mx-auto px-6 py-8 print:py-4">
        <h2 className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-6 print:text-gray-500">
          Your Visual Identity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4">
          {/* Portrait */}
          <div className="bg-white/60 border border-foreground/10 rounded-2xl overflow-hidden print:border print:border-gray-300">
            <div className="aspect-[3/4] relative print:aspect-[3/4]">
              {brandKit.portraitImageUrl ? (
                <Image
                  src={brandKit.portraitImageUrl}
                  alt={`Portrait for ${brandKit.stageNames[0]?.name}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                  <Eye size={32} className="text-foreground/30" />
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-foreground/10 print:border-t print:border-gray-300">
              <p className="font-serif text-xs uppercase tracking-wider text-foreground/40 print:text-gray-500">
                Artist Portrait
              </p>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white/60 border border-foreground/10 rounded-2xl overflow-hidden print:border print:border-gray-300">
            <div className="aspect-square relative print:aspect-square">
              {brandKit.logoImageUrl ? (
                <Image
                  src={brandKit.logoImageUrl}
                  alt={`Logo for ${brandKit.stageNames[0]?.name}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                  <Eye size={32} className="text-foreground/30" />
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-foreground/10 print:border-t print:border-gray-300">
              <p className="font-serif text-xs uppercase tracking-wider text-foreground/40 print:text-gray-500">
                Artist Logo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PLATFORM AVAILABILITY ===== */}
      {Object.keys(brandKit.availability).length > 0 && (
        <div className="max-w-4xl mx-auto px-6 py-8 print:py-4">
          <h2 className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-6 print:text-gray-500">
            Platform Availability
          </h2>
          <div className="flex flex-col gap-6">
            {brandKit.stageNames.map((sn, i) => {
              const avail = brandKit.availability[sn.name];
              if (!avail) return null;

              return (
                <div
                  key={i}
                  className="bg-white/60 border border-foreground/10 rounded-2xl p-6 print:p-4 print:border print:border-gray-300 print:bg-white"
                >
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                    {sn.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(PLATFORM_LABELS).map(
                      ([key, { label, icon }]) => {
                        const platform = avail[key as keyof NameAvailability];
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
                                  <Check
                                    size={10}
                                    className="text-green-600"
                                  />
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
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
