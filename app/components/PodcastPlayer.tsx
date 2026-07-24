"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Play, Pause, Loader2, RotateCcw, Radio, Music } from "lucide-react";

interface PodcastSegment {
  type: "host" | "artist" | "audience" | "music";
  text: string;
}

interface PodcastPlayerProps {
  slug: string;
  artistName: string;
  nameReason: string;
  genre?: string;
  vibe?: string;
  musicUrl?: string;
}

const VOICE_MAP: Record<string, string> = {
  host: "JBFqnCBsd6RMkjVDRZzb",
  artist: "TxGEqnHWrfWFTfGW9XjX",
  audience: "JBFqnCBsd6RMkjVDRZzb",
};

const SPEAKER_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  host: { label: "HOST", icon: "🎙", color: "text-amber-400" },
  artist: { label: "ARTIST", icon: "🎤", color: "text-pink-400" },
  audience: { label: "AUDIENCE", icon: "👥", color: "text-cyan-400" },
  music: { label: "♪ MUSIC", icon: "🎵", color: "text-purple-400" },
};

const MUSIC_FADE_DURATION = 1500;
const MUSIC_DUCK_VOLUME = 0.12;
const MUSIC_FULL_VOLUME = 0.7;

export default function PodcastPlayer({
  slug,
  artistName,
  nameReason,
  genre,
  vibe,
  musicUrl,
}: PodcastPlayerProps) {
  const [segments, setSegments] = useState<PodcastSegment[]>([]);
  const [readyFlags, setReadyFlags] = useState<boolean[]>([]);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "error">("idle");
  const [currentSegment, setCurrentSegment] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  const audioUrlsRef = useRef<(string | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const musicFadeRef = useRef<number | null>(null);

  const fadeMusic = useCallback((targetVolume: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const music = musicRef.current;
      if (!music) { resolve(); return; }

      const startVolume = music.volume;
      const startTime = Date.now();

      if (musicFadeRef.current) cancelAnimationFrame(musicFadeRef.current);

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        music.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) {
          musicFadeRef.current = requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      tick();
    });
  }, []);

  const playMusicSegment = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      const music = musicRef.current;
      if (!music) {
        setTimeout(resolve, 3000);
        return;
      }

      music.currentTime = text === "THEME MUSIC" ? 0 : music.currentTime;
      music.volume = 0;
      music.play().catch(() => {});

      fadeMusic(MUSIC_FULL_VOLUME, MUSIC_FADE_DURATION).then(() => {
        const holdTime = 4000;
        setTimeout(() => {
          fadeMusic(0, MUSIC_FADE_DURATION).then(() => {
            music.pause();
            resolve();
          });
        }, holdTime);
      });
    });
  }, [fadeMusic]);

  const playAudio = useCallback((url: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!isPlayingRef.current) { resolve(); return; }

      if (audioRef.current) audioRef.current.pause();

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }, []);

  const startShow = useCallback(async () => {
    setError(null);
    isPlayingRef.current = true;
    setStatus("playing");
    setShowIntro(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const scriptRes = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, artistName, nameReason, genre, vibe }),
      });
      if (!scriptRes.ok) throw new Error("Failed to generate script");
      const { script } = await scriptRes.json();

      setSegments(script);
      const flags = new Array(script.length).fill(false);
      setReadyFlags([...flags]);
      audioUrlsRef.current = new Array(script.length).fill(null);

      if (musicUrl) {
        const music = new Audio(musicUrl);
        music.preload = "auto";
        musicRef.current = music;
      }

      const generators = script.map(async (segment: PodcastSegment, i: number) => {
        if (segment.type === "music") {
          flags[i] = true;
          setReadyFlags([...flags]);
          return;
        }
        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: segment.text, voiceId: VOICE_MAP[segment.type] }),
            signal: controller.signal,
          });
          if (!res.ok) return;
          const blob = await res.blob();
          audioUrlsRef.current[i] = URL.createObjectURL(blob);
          flags[i] = true;
          setReadyFlags([...flags]);
        } catch { /* skip failed segment */ }
      });

      setTimeout(() => setShowIntro(false), 2000);

      for (let i = 0; i < script.length; i++) {
        if (!isPlayingRef.current) break;

        await generators[i];
        if (!isPlayingRef.current) break;

        setCurrentSegment(i);
        const segment = script[i];

        if (segment.type === "music") {
          await playMusicSegment(segment.text);
        } else {
          const url = audioUrlsRef.current[i];
          if (url) {
            if (musicRef.current && !musicRef.current.paused) {
              await fadeMusic(MUSIC_DUCK_VOLUME, 500);
            }
            await playAudio(url);
            if (musicRef.current && !musicRef.current.paused) {
              await fadeMusic(MUSIC_FULL_VOLUME, 500);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to generate show");
      setStatus("error");
    } finally {
      isPlayingRef.current = false;
      setStatus((s) => s === "error" ? s : "idle");
      setCurrentSegment(-1);
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    }
  }, [slug, artistName, nameReason, genre, vibe, musicUrl, playAudio, playMusicSegment, fadeMusic]);

  const pauseShow = () => {
    isPlayingRef.current = false;
    audioRef.current?.pause();
    if (musicRef.current) musicRef.current.pause();
    if (musicFadeRef.current) cancelAnimationFrame(musicFadeRef.current);
    setStatus("paused");
  };

  const resumeShow = async () => {
    isPlayingRef.current = true;
    setStatus("playing");
    const nextIndex = currentSegment + 1;
    for (let i = nextIndex; i < audioUrlsRef.current.length; i++) {
      if (!isPlayingRef.current) break;
      const segment = segments[i];
      setCurrentSegment(i);

      if (segment.type === "music") {
        await playMusicSegment(segment.text);
      } else {
        const url = audioUrlsRef.current[i];
        if (url) await playAudio(url);
      }
    }
    isPlayingRef.current = false;
    setStatus("idle");
    setCurrentSegment(-1);
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
  };

  const resetShow = () => {
    abortRef.current?.abort();
    isPlayingRef.current = false;
    audioRef.current?.pause();
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
    if (musicFadeRef.current) cancelAnimationFrame(musicFadeRef.current);
    audioUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url));
    audioUrlsRef.current = [];
    setSegments([]);
    setReadyFlags([]);
    setCurrentSegment(-1);
    setStatus("idle");
    setError(null);
    setShowIntro(false);
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      audioRef.current?.pause();
      if (musicRef.current) musicRef.current.pause();
      if (musicFadeRef.current) cancelAnimationFrame(musicFadeRef.current);
      audioUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, []);

  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const hasStarted = segments.length > 0;

  return (
    <div className="rounded-3xl border-2 border-foreground/10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6 shadow-2xl overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl transition-opacity duration-1000 ${isPlaying ? "bg-pink-500/10 opacity-100" : "bg-pink-500/5 opacity-50"}`} />
        <div className={`absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl transition-opacity duration-1000 ${isPlaying ? "bg-amber-500/8 opacity-100" : "bg-amber-500/3 opacity-30"}`} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-neutral-800"}`}>
            <Radio size={18} className={`transition-colors ${isPlaying ? "text-white animate-pulse" : "text-neutral-500"}`} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white tracking-wide">
              THE STAGE NAME CLUB SHOW
            </h3>
            <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-neutral-500">
              Live from the studio
            </p>
          </div>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-serif uppercase tracking-wider text-red-400 font-semibold">On Air</span>
          </div>
        )}
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl animate-pulse">
          <div className="text-center">
            <p className="text-xs font-serif uppercase tracking-[0.5em] text-pink-400 mb-2">Now presenting</p>
            <p className="text-3xl font-serif font-bold text-white">{artistName}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="relative mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-serif">
          {error}
        </div>
      )}

      {/* Transcript */}
      {hasStarted && (
        <div className="relative mb-5 space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700">
          {segments.map((segment, i) => {
            const isReady = readyFlags[i];
            const isActive = i === currentSegment;
            const isPast = i < currentSegment;
            const config = SPEAKER_CONFIG[segment.type];

            if (segment.type === "music") {
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-2 px-4 rounded-xl transition-all duration-500 ${
                    isActive
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : isPast
                        ? "opacity-30"
                        : "opacity-20"
                  }`}
                >
                  <Music size={16} className={`flex-shrink-0 ${isActive ? "text-purple-400 animate-bounce" : "text-neutral-600"}`} />
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="flex items-end gap-0.5 h-4">
                        {[1, 2, 3, 4, 5].map((bar) => (
                          <div
                            key={bar}
                            className="w-1 bg-purple-400 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 100}%`,
                              animationDelay: `${bar * 0.1}s`,
                              animationDuration: `${0.4 + bar * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <span className={`text-xs font-serif uppercase tracking-wider ${isActive ? "text-purple-400" : "text-neutral-600"}`}>
                      {segment.text === "THEME MUSIC" ? "♪ Theme Music" : "♪ Outro Music"}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  isActive ? "scale-[1.02] translate-x-1" : isPast ? "opacity-40" : "opacity-30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs ${config.color} font-semibold`}>
                    {config.icon}
                  </span>
                  <span className={`text-[10px] font-serif uppercase tracking-[0.2em] ${config.color} opacity-70`}>
                    {config.label}
                  </span>
                  {!isReady && (
                    <Loader2 size={10} className="animate-spin text-pink-400" />
                  )}
                  {isActive && (
                    <div className="flex items-end gap-0.5 h-3 ml-auto">
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className={`w-0.5 rounded-full ${config.color} bg-current animate-pulse`}
                          style={{
                            height: `${40 + Math.random() * 60}%`,
                            animationDelay: `${bar * 0.15}s`,
                            animationDuration: `${0.3 + bar * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className={`font-serif leading-relaxed pl-5 ${
                  isActive ? "text-white font-medium" : "text-neutral-400"
                } ${segment.type === "audience" ? "italic text-center uppercase tracking-wider text-sm" : ""}`}>
                  {segment.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="relative flex items-center gap-3">
        {!hasStarted ? (
          <button
            onClick={startShow}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:from-pink-400 hover:to-rose-400 transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40"
          >
            <Mic size={16} className="group-hover:rotate-12 transition-transform" />
            Generate Your Show
          </button>
        ) : isPlaying ? (
          <button
            onClick={pauseShow}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10"
          >
            <Pause size={16} fill="white" />
            Pause
          </button>
        ) : isPaused ? (
          <>
            <button
              onClick={resumeShow}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:from-pink-400 hover:to-rose-400 transition-all"
            >
              <Play size={16} fill="white" />
              Resume
            </button>
            <button
              onClick={resetShow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 font-serif text-sm text-neutral-400 hover:text-white hover:border-white/30 transition-all"
            >
              <RotateCcw size={14} />
              Restart
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startShow}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:from-pink-400 hover:to-rose-400 transition-all shadow-lg shadow-pink-500/20"
            >
              <Play size={16} fill="white" />
              Replay
            </button>
            <button
              onClick={resetShow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 font-serif text-sm text-neutral-400 hover:text-white hover:border-white/30 transition-all"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </>
        )}

        {musicUrl && hasStarted && (
          <div className="ml-auto flex items-center gap-1.5 text-neutral-500">
            <Music size={12} />
            <span className="text-[10px] font-serif uppercase tracking-wider">Your music</span>
          </div>
        )}
      </div>
    </div>
  );
}
