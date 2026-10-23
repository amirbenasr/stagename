"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Film,
  Link2,
  Loader2,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { BrandKitVideo } from "../../lib/types";

interface FirstTakePlayerProps {
  video?: BrandKitVideo;
  /** Older kits stored a flat videoUrl. */
  legacyVideoUrl?: string;
  stageName: string;
  genre?: string;
  vibe?: string;
  /** Portrait used as a blurred backdrop while the clip renders. */
  fallbackPoster?: string;
  /** Brand-kit slug, used for share cards and the canonical link. */
  slug?: string;
}

function musicCredit(video?: BrandKitVideo): string {
  if (!video?.musicUrl) return "Original studio beat";
  if (video.musicSource === "artist") return "Your track";
  if (video.musicSource === "library") return "Studio bed";
  return "Original studio beat";
}

export default function FirstTakePlayer({
  video,
  legacyVideoUrl,
  stageName,
  genre,
  vibe,
  fallbackPoster,
  slug,
}: FirstTakePlayerProps) {
  const src = video?.status === "ready" ? video.url : legacyVideoUrl;
  const isRendering = video?.status === "rendering" && !src;
  const isFailed = video?.status === "failed" && !src;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSlow, setIsSlow] = useState(false);
  const [copied, setCopied] = useState(false);

  const siteOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://stagename.club"
  ).replace(/\/$/, "");
  const shareUrl = slug ? `${siteOrigin}/brand-kit/${slug}` : undefined;

  // Soundtrack fallback: if the mux endpoint failed, keep the audio in the
  // player and clock it to the video so the clip is never silent.
  const needsSyncedAudio = Boolean(
    video?.musicUrl && !video.musicMuxed && video.status === "ready"
  );

  const syncAudio = useCallback(() => {
    if (!needsSyncedAudio) return;
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    if (!videoEl || !audioEl) return;

    if (Math.abs(audioEl.currentTime - videoEl.currentTime) > 0.35) {
      audioEl.currentTime = videoEl.currentTime;
    }
  }, [needsSyncedAudio]);

  const play = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;

    try {
      await el.play();
      setIsPlaying(true);
      setHasStarted(true);

      if (needsSyncedAudio && audioRef.current) {
        audioRef.current.currentTime = el.currentTime;
        audioRef.current.muted = muted;
        void audioRef.current.play().catch(() => {});
      }
    } catch {
      setIsPlaying(false);
    }
  }, [needsSyncedAudio, muted]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    void play();
  }, [play]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    // When the soundtrack is a separate synced track, the video's own audio
    // stays muted so the two never play over each other.
    if (videoRef.current) videoRef.current.muted = next || needsSyncedAudio;
    if (audioRef.current) audioRef.current.muted = next;
  }, [muted, needsSyncedAudio]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the link is still visible on the page.
    }
  }, [shareUrl]);

  const shareKit = useCallback(async () => {
    if (!shareUrl) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${stageName} — stagename.club`,
          text: "Meet the artist I've been becoming.",
          url: shareUrl,
        });
        return;
      } catch {
        // User dismissed the sheet — fall through to copy.
      }
    }

    await copyLink();
  }, [shareUrl, stageName, copyLink]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted || needsSyncedAudio;
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, needsSyncedAudio]);

  // If a render stalls, switch the copy from "usually a minute" to an honest
  // "still rendering" instead of showing the same optimistic line forever.
  useEffect(() => {
    if (!isRendering || !video?.startedAt) return;

    const started = new Date(video.startedAt).getTime();
    const remaining = Math.max(0, 8 * 60 * 1000 - (Date.now() - started));
    const timer = setTimeout(() => setIsSlow(true), remaining);

    return () => clearTimeout(timer);
  }, [isRendering, video?.startedAt]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  if (isFailed) return null;
  if (!src && !isRendering) return null;

  const poster = video?.posterUrl || fallbackPoster;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.8)]">
      {/* Ambient studio glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-coral/20 blur-3xl transition-opacity duration-1000 ${
            isPlaying ? "opacity-100" : "opacity-40"
          }`}
        />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                isPlaying ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-white/5"
              }`}
            >
              <Film size={17} className={isPlaying ? "text-white" : "text-white/50"} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide text-white">
                The First Take
              </h3>
              <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-white/40">
                {stageName} · take 01
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-[10px] font-serif font-semibold uppercase tracking-wider text-red-400">
                  Rolling
                </span>
              </span>
            )}
            {(genre || vibe) && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-serif text-white/50 sm:inline-flex">
                {[genre, vibe].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>

        {/* Screen */}
        <div className="relative mb-5 aspect-video overflow-hidden rounded-2xl bg-black">
          {isRendering ? (
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden">
              {poster && (
                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
                  style={{ backgroundImage: `url(${poster})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
              <Loader2 size={28} className="relative animate-spin text-coral" />
              <div className="relative text-center">
                <p className="font-serif text-sm font-semibold text-white">
                  {isSlow ? "Still rendering" : "Filming your first take"}
                </p>
                <p className="mt-1 font-serif text-xs text-white/40">
                  {isSlow
                    ? "This one is taking longer than usual — your kit is saved and the clip will appear here."
                    : "Compose · animate · mix — usually under two minutes"}
                </p>
              </div>
              <div className="relative h-1 w-48 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 animate-[ft-slide_1.6s_ease-in-out_infinite] rounded-full bg-coral" />
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                preload="metadata"
                playsInline
                className="h-full w-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  audioRef.current?.pause();
                }}
                onTimeUpdate={(event) => {
                  const el = event.currentTarget;
                  if (el.duration) setProgress((el.currentTime / el.duration) * 100);
                  syncAudio();
                }}
              />

              {/* Play overlay */}
              {!hasStarted && (
                <button
                  type="button"
                  onClick={play}
                  aria-label={`Play ${stageName}'s first take`}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/10 to-black/30 transition hover:bg-black/30"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition hover:scale-105">
                    <Play size={24} className="translate-x-0.5 fill-neutral-950 text-neutral-950" />
                  </span>
                </button>
              )}

              {needsSyncedAudio && (
                <audio ref={audioRef} src={video?.musicUrl} preload="auto" loop />
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {isRendering ? (
            <p className="font-serif text-xs text-white/40">
              You can leave this page — the clip will be here when you come back.
            </p>
          ) : (
            <>
              {isPlaying ? (
                <button
                  type="button"
                  onClick={pause}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 font-serif text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-white/20"
                >
                  <Pause size={15} fill="currentColor" />
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={play}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-coral to-[#d4451f] px-6 py-2.5 font-serif text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-coral/20 transition hover:brightness-110"
                >
                  <Play size={15} fill="currentColor" />
                  {hasStarted ? "Play" : "Watch the take"}
                </button>
              )}

              <button
                type="button"
                onClick={restart}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 font-serif text-sm text-white/60 transition hover:border-white/30 hover:text-white"
              >
                <RotateCcw size={14} />
                Restart
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:text-white"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {src && (
                <a
                  href={src}
                  download={`${stageName.replace(/\s+/g, "-").toLowerCase()}-first-take.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 font-serif text-sm text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  <Download size={14} />
                  Save clip
                </a>
              )}
            </>
          )}
        </div>

        {/* Progress */}
        {src && (
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-coral transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Footer credit */}
        <div className="mt-4 flex items-center gap-2 text-white/35">
          <Music2 size={12} />
          <p className="font-serif text-[11px]">
            {musicCredit(video)} · {video?.durationSeconds ?? 10}s · one take, no cuts
          </p>
        </div>

        {/* Share kit */}
        {shareUrl && slug && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="mr-1 font-serif text-[10px] uppercase tracking-[0.3em] text-white/35">
              Share
            </span>

            <a
              href={`/api/share-card/${slug}?format=story`}
              download={`${slug}-story.png`}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-serif text-xs text-white/55 transition hover:border-white/30 hover:text-white"
            >
              <Download size={12} />
              Story 9:16
            </a>

            <a
              href={`/api/share-card/${slug}?format=profile`}
              download={`${slug}-post.png`}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-serif text-xs text-white/55 transition hover:border-white/30 hover:text-white"
            >
              <Download size={12} />
              Post 1:1
            </a>

            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-serif text-xs text-white/55 transition hover:border-white/30 hover:text-white"
            >
              <Link2 size={12} />
              {copied ? "Copied" : "Copy link"}
            </button>

            <button
              type="button"
              onClick={shareKit}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-serif text-xs text-white/55 transition hover:border-white/30 hover:text-white"
            >
              <Share2 size={12} />
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
