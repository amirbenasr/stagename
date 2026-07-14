"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Play, Pause, Loader2, RotateCcw } from "lucide-react";

interface PodcastSegment {
  speaker: "host" | "artist" | "audience";
  text: string;
}

interface PodcastPlayerProps {
  artistName: string;
  nameReason: string;
  genre?: string;
  vibe?: string;
}

const VOICE_MAP: Record<PodcastSegment["speaker"], string> = {
  host: "JBFqnCBsd6RMkjVDRZzb",
  artist: "TxGEqnHWrfWFTfGW9XjX",
  audience: "JBFqnCBsd6RMkjVDRZzb",
};

const SPEAKER_LABELS: Record<PodcastSegment["speaker"], string> = {
  host: "🎙 HOST",
  artist: "🎤 ARTIST",
  audience: "👥 AUDIENCE",
};

export default function PodcastPlayer({
  artistName,
  nameReason,
  genre,
  vibe,
}: PodcastPlayerProps) {
  const [segments, setSegments] = useState<PodcastSegment[]>([]);
  const [readyFlags, setReadyFlags] = useState<boolean[]>([]);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "error">("idle");
  const [currentSegment, setCurrentSegment] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const audioUrlsRef = useRef<(string | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

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

  const startPodcast = useCallback(async () => {
    setError(null);
    isPlayingRef.current = true;
    setStatus("playing");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const scriptRes = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistName, nameReason, genre, vibe }),
      });
      if (!scriptRes.ok) throw new Error("Failed to generate script");
      const { script } = await scriptRes.json();

      setSegments(script);
      const flags = new Array(script.length).fill(false);
      setReadyFlags([...flags]);
      audioUrlsRef.current = new Array(script.length).fill(null);

      // Generate all segments in parallel
      const generators = script.map(async (segment: PodcastSegment, i: number) => {
        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: segment.text, voiceId: VOICE_MAP[segment.speaker] }),
            signal: controller.signal,
          });
          if (!res.ok) return;
          const blob = await res.blob();
          audioUrlsRef.current[i] = URL.createObjectURL(blob);
          flags[i] = true;
          setReadyFlags([...flags]);
        } catch { /* skip failed segment */ }
      });

      // Play each segment sequentially, waiting for its audio
      for (let i = 0; i < script.length; i++) {
        if (!isPlayingRef.current) break;

        // Wait for this segment to finish generating
        await generators[i];
        if (!isPlayingRef.current) break;

        const url = audioUrlsRef.current[i];
        if (!url) continue;

        setCurrentSegment(i);
        await playAudio(url);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to generate podcast");
      setStatus("error");
    } finally {
      isPlayingRef.current = false;
      setStatus((s) => s === "error" ? s : "idle");
      setCurrentSegment(-1);
    }
  }, [artistName, nameReason, genre, vibe, playAudio]);

  const pausePodcast = () => {
    isPlayingRef.current = false;
    audioRef.current?.pause();
    setStatus("paused");
  };

  const resumePodcast = async () => {
    isPlayingRef.current = true;
    setStatus("playing");
    const nextIndex = currentSegment + 1;
    for (let i = nextIndex; i < audioUrlsRef.current.length; i++) {
      if (!isPlayingRef.current) break;
      const url = audioUrlsRef.current[i];
      if (!url) continue;
      setCurrentSegment(i);
      await playAudio(url);
    }
    isPlayingRef.current = false;
    setStatus("idle");
    setCurrentSegment(-1);
  };

  const resetPodcast = () => {
    abortRef.current?.abort();
    isPlayingRef.current = false;
    audioRef.current?.pause();
    audioUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url));
    audioUrlsRef.current = [];
    setSegments([]);
    setReadyFlags([]);
    setCurrentSegment(-1);
    setStatus("idle");
    setError(null);
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      audioRef.current?.pause();
      audioUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, []);

  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const hasStarted = segments.length > 0;

  return (
    <div className="rounded-3xl border-2 border-foreground/10 bg-gradient-to-br from-white/80 to-pink-accent/5 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-pink-accent/10 flex items-center justify-center">
          <Mic size={20} className="text-pink-accent" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Podcast Intro
          </h3>
          <p className="text-xs font-serif text-foreground/50">
            Hear your artist debut
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-serif">
          {error}
        </div>
      )}

      {hasStarted && (
        <div className="mb-4 space-y-3 max-h-64 overflow-y-auto">
          {segments.map((segment, i) => {
            const isReady = readyFlags[i];
            const isActive = i === currentSegment;
            const isPast = i < currentSegment;

            return (
              <div
                key={i}
                className={`transition-all duration-300 ${
                  isActive ? "scale-[1.02]" : isPast ? "opacity-50" : "opacity-40"
                }`}
              >
                <p className="text-xs font-serif uppercase tracking-wider text-foreground/40 mb-1">
                  {SPEAKER_LABELS[segment.speaker]}
                  {!isReady && (
                    <span className="ml-2 inline-flex items-center gap-1 text-pink-accent">
                      <Loader2 size={10} className="animate-spin" />
                    </span>
                  )}
                </p>
                <p className={`font-serif leading-relaxed ${
                  isActive ? "text-foreground font-medium" : "text-foreground/70"
                }`}>
                  {segment.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!hasStarted ? (
          <button
            onClick={startPodcast}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-accent text-white font-serif font-semibold text-sm uppercase tracking-wider hover:bg-pink-accent/90 transition-all"
          >
            <Mic size={16} />
            Generate Interview
          </button>
        ) : isPlaying ? (
          <button
            onClick={pausePodcast}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-white font-serif font-semibold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-all"
          >
            <Pause size={16} fill="white" />
            Pause
          </button>
        ) : isPaused ? (
          <>
            <button
              onClick={resumePodcast}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-accent text-white font-serif font-semibold text-sm uppercase tracking-wider hover:bg-pink-accent/90 transition-all"
            >
              <Play size={16} fill="white" />
              Resume
            </button>
            <button
              onClick={resetPodcast}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-foreground/20 font-serif text-sm text-foreground/60 hover:border-foreground hover:text-foreground transition-all"
            >
              <RotateCcw size={14} />
              Restart
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startPodcast}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-accent text-white font-serif font-semibold text-sm uppercase tracking-wider hover:bg-pink-accent/90 transition-all"
            >
              <Play size={16} fill="white" />
              Replay
            </button>
            <button
              onClick={resetPodcast}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-foreground/20 font-serif text-sm text-foreground/60 hover:border-foreground hover:text-foreground transition-all"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
