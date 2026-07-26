"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Radio, Loader2 } from "lucide-react";
import type { InterviewLine } from "../../lib/types";

interface InterviewVideoPlayerProps {
  videoUrl?: string;
  interviewScript?: InterviewLine[];
  artistName: string;
  genre?: string;
  vibe?: string;
}

const SPEAKER_CONFIG: Record<string, { label: string; color: string }> = {
  host: { label: "CHARLAMAGNE", color: "text-amber-400" },
  artist: { label: "ARTIST", color: "text-pink-400" },
};

export default function InterviewVideoPlayer({
  videoUrl,
  interviewScript,
  artistName,
  genre,
  vibe,
}: InterviewVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalLines = interviewScript?.length ?? 0;
  const durationPerLine = totalLines > 0 ? 15000 / totalLines : 3750;

  const clearCaptionInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCaptions = useCallback(() => {
    clearCaptionInterval();
    setCurrentLineIndex(0);
    let index = 0;
    intervalRef.current = setInterval(() => {
      index += 1;
      if (index >= totalLines) {
        clearCaptionInterval();
        setCurrentLineIndex(-1);
      } else {
        setCurrentLineIndex(index);
      }
    }, durationPerLine);
  }, [totalLines, durationPerLine, clearCaptionInterval]);

  const handlePlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
    setHasStarted(true);
    startCaptions();
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    clearCaptionInterval();
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
    setHasStarted(true);
    startCaptions();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    clearCaptionInterval();
    setCurrentLineIndex(-1);
  };

  useEffect(() => {
    return () => clearCaptionInterval();
  }, [clearCaptionInterval]);

  const currentLine = currentLineIndex >= 0 && interviewScript ? interviewScript[currentLineIndex] : null;

  return (
    <div className="rounded-3xl border-2 border-foreground/10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6 shadow-2xl overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl transition-opacity duration-1000 ${isPlaying ? "bg-amber-500/10 opacity-100" : "bg-amber-500/5 opacity-50"}`} />
        <div className={`absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl transition-opacity duration-1000 ${isPlaying ? "bg-pink-500/8 opacity-100" : "bg-pink-500/3 opacity-30"}`} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-neutral-800"}`}>
            <Radio size={18} className={`transition-colors ${isPlaying ? "text-white animate-pulse" : "text-neutral-500"}`} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white tracking-wide">
              THE BREAKFAST CLUB
            </h3>
            <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-neutral-500">
              Exclusive Interview
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

      {/* Video Player */}
      <div className="relative mb-5 rounded-2xl overflow-hidden bg-black aspect-video">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            playsInline
            onEnded={handleVideoEnd}
            poster={undefined}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-neutral-900">
            <Loader2 size={32} className="text-pink-accent animate-spin" />
            <p className="font-serif text-sm text-neutral-400">Generating your interview video...</p>
            <p className="font-serif text-xs text-neutral-600">This can take a few minutes</p>
          </div>
        )}

        {/* Caption overlay */}
        {currentLine && hasStarted && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-serif uppercase tracking-[0.2em] font-bold ${SPEAKER_CONFIG[currentLine.speaker]?.color ?? "text-white"}`}>
                {SPEAKER_CONFIG[currentLine.speaker]?.label ?? currentLine.speaker}
              </span>
            </div>
            <p className="font-serif text-sm sm:text-base text-white font-medium leading-snug">
              {currentLine.text}
            </p>
          </div>
        )}
      </div>

      {/* Script preview (when not playing) */}
      {!isPlaying && hasStarted && interviewScript && (
        <div className="relative mb-5 space-y-2 max-h-40 overflow-y-auto pr-2">
          {interviewScript.map((line, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 py-1.5 px-3 rounded-lg transition-all ${
                i === currentLineIndex
                  ? "bg-white/5"
                  : i < currentLineIndex
                    ? "opacity-40"
                    : "opacity-60"
              }`}
            >
              <span className={`text-[10px] font-serif uppercase tracking-[0.15em] font-bold flex-shrink-0 mt-0.5 ${
                SPEAKER_CONFIG[line.speaker]?.color ?? "text-neutral-400"
              }`}>
                {SPEAKER_CONFIG[line.speaker]?.label ?? line.speaker}
              </span>
              <p className={`font-serif text-xs leading-relaxed ${
                i === currentLineIndex ? "text-white" : "text-neutral-400"
              }`}>
                {line.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="relative flex items-center gap-3">
        {!hasStarted ? (
          <button
            onClick={handlePlay}
            disabled={!videoUrl}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} className="group-hover:rotate-12 transition-transform" fill="white" />
            Watch Interview
          </button>
        ) : isPlaying ? (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10"
          >
            <Pause size={16} fill="white" />
            Pause
          </button>
        ) : (
          <>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-serif font-semibold text-sm uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
            >
              <Play size={16} fill="white" />
              Replay
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 font-serif text-sm text-neutral-400 hover:text-white hover:border-white/30 transition-all"
            >
              <RotateCcw size={14} />
              Restart
            </button>
          </>
        )}

        {(genre || vibe) && hasStarted && (
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {genre && (
              <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-serif text-neutral-400">
                {genre}
              </span>
            )}
            {vibe && (
              <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-serif text-neutral-400">
                {vibe}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
