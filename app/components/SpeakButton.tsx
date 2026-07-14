"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Prioritize high-quality natural voices
  const chosenVoice =
    voices.find((v) => v.name.includes("Microsoft Mark")) ||
    voices.find((v) => v.name.includes("Google US English")) ||
    voices.find((v) => v.name.includes("Samantha")) ||
    voices.find((v) => v.name.includes("Natural")) ||
    voices.find((v) => v.name.includes("Neural")) ||
    voices.find((v) => v.lang.startsWith("en") && v.localService === false) || // Cloud voices
    voices.find((v) => v.lang.startsWith("en"));

  return chosenVoice || null;
}

function speakBrowser(text: string): {
  stop: () => void;
  onEnd: (cb: () => void) => void;
  onError: (cb: () => void) => void;
} {
  const cleaned = text
    .replace(/\s*[/|]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleaned);
  const voice = pickBestVoice();
  if (voice) utterance.voice = voice;
  
  // Optimized for natural speech
  utterance.rate = 0.95;  // Slightly slower for clarity
  utterance.pitch = 1.0;  // Natural pitch
  utterance.volume = 1.0;

  let endCb = () => {};
  let errCb = () => {};
  utterance.onend = () => endCb();
  utterance.onerror = () => errCb();

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => window.speechSynthesis.cancel(),
    onEnd: (cb: () => void) => { endCb = cb; },
    onError: (cb: () => void) => { errCb = cb; },
  };
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
  const stopRef = useRef<(() => void) | null>(null);

  const speak = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      stopRef.current?.();

      const handle = speakBrowser(text);
      stopRef.current = handle.stop;
      handle.onEnd(() => setSpeaking(false));
      handle.onError(() => setSpeaking(false));
      setSpeaking(true);
    },
    [text]
  );

  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

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
