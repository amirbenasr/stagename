"use client";

import { useState, useCallback, useEffect } from "react";
import { Volume2 } from "lucide-react";

const VOICE_PREFERENCES = [
  "Google",
  "Microsoft",
  "Natural",
  "Neural",
  "Enhanced",
];

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const english = voices.filter((v) => v.lang.startsWith("en"));
  const pool = english.length ? english : voices;

  for (const pref of VOICE_PREFERENCES) {
    const match = pool.find((v) =>
      v.name.toLowerCase().includes(pref.toLowerCase())
    );
    if (match) return match;
  }

  return pool[0];
}

export default function SpeakButton({
  text,
  size = 14,
  className = "",
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    // Voices load async in some browsers
    window.speechSynthesis.getVoices();
  }, []);

  const speak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickBestVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Pronounce ${text}`}
      className={`print:hidden inline-flex items-center justify-center rounded-full transition-all duration-200 ${
        speaking
          ? "bg-pink-accent/15 text-pink-accent scale-110"
          : "bg-foreground/5 text-foreground/40 hover:bg-pink-accent/10 hover:text-pink-accent"
      } ${className}`}
    >
      <Volume2
        size={size}
        className={speaking ? "animate-pulse" : ""}
      />
    </button>
  );
}
