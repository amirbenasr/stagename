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

      {/* ===== STAGE NAMES ===== */}
      <div className="max-w-4xl mx-auto px-6 py-8 print:py-4">
        <h2 className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent mb-6 print:text-gray-500">
          Your Stage Names
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:gap-4">
          {brandKit.stageNames.map((sn, i) => (
            <div
              key={i}
              className={`bg-white/60 border border-foreground/10 rounded-2xl p-6 print:p-4 print:border print:border-gray-300 print:bg-white transition-all duration-500 hover:shadow-xl hover:border-pink-accent/20 ${
                i === 0
                  ? "ring-2 ring-pink-accent/30 print:ring-2 print:ring-gray-400"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif font-bold ${
                    i === 0
                      ? "holographic text-white"
                      : "bg-foreground/10 text-foreground/60"
                  } print:bg-gray-200 print:text-gray-600`}
                >
                  {i + 1}
                </span>
                {i === 0 && (
                  <span className="text-xs font-serif uppercase tracking-wider text-pink-accent print:text-gray-500">
                    Top Pick
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2 print:text-lg">
                {sn.name}
              </h3>
              <p className="font-serif text-sm text-foreground/50 leading-relaxed print:text-xs print:text-gray-600 mb-3">
                {sn.reason}
              </p>
              {sn.model && (
                <span className="inline-flex items-center gap-1 text-[10px] font-serif uppercase tracking-wider text-foreground/30 bg-foreground/5 rounded-full px-2 py-0.5">
                  <Globe size={8} />
                  {sn.model}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== STUDIO PHOTO ===== */}
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
      <div className="max-w-4xl mx-auto px-6 py-12 print:hidden">
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

      {/* ===== PRINT FOOTER ===== */}
      <div className="hidden print:block print:mt-8 print:text-center print:text-xs print:text-gray-400">
        <p>stagename.club — Artist Debut Brand Kit</p>
        <p>Unique link: stagename.club/brand-kit/{slug}</p>
      </div>
    </div>
  );
}
