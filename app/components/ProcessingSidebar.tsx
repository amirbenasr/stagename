"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, Mail, Check, Terminal } from "lucide-react";

interface ProcessingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
}

const STAGES = [
  {
    label: "Analyzing 4.2M linguistic variations...",
    duration: 4000,
    icon: "🧬",
  },
  {
    label: "Cross-referencing global social availability handles...",
    duration: 4000,
    icon: "🌐",
  },
];

const TOTAL_DURATION = STAGES.reduce((sum, s) => sum + s.duration, 0);

export default function ProcessingSidebar({
  isOpen,
  onClose,
  submissionId,
}: ProcessingSidebarProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [processingDone, setProcessingDone] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSidebarVisible(false);
      return;
    }

    setCurrentStage(0);
    setStageProgress(0);
    setProcessingDone(false);
    setEmail("");
    setSending(false);
    setEmailSent(false);
    setError("");
    setSidebarVisible(true);

    let elapsed = 0;
    let stageIdx = 0;

    const tick = setInterval(() => {
      elapsed += 100;
      const stageElapsed =
        elapsed -
        STAGES.slice(0, stageIdx).reduce((s, st) => s + st.duration, 0);
      const currentDuration = STAGES[stageIdx].duration;
      const progress = Math.min(stageElapsed / currentDuration, 1);

      setStageProgress(progress);
      setCurrentStage(stageIdx);

      if (stageElapsed >= currentDuration && stageIdx < STAGES.length - 1) {
        stageIdx++;
        setCurrentStage(stageIdx);
        setStageProgress(0);
      }

      if (elapsed >= TOTAL_DURATION) {
        clearInterval(tick);
        setProcessingDone(true);
        setCurrentStage(STAGES.length - 1);
        setStageProgress(1);
      }
    }, 100);

    return () => clearInterval(tick);
  }, [isOpen]);

  const handleSendLink = useCallback(async () => {
    if (!email.trim() || !email.includes("@")) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, email: email.trim() }),
      });

      if (res.ok) {
        setEmailSent(true);
      } else {
        const json = await res.json();
        setError(json.error || "Failed to send email");
        setSending(false);
      }
    } catch {
      setError("Network error — please try again");
      setSending(false);
    }
  }, [email, submissionId]);

  if (!isOpen && !sidebarVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-beige shadow-2xl flex flex-col ${
          isOpen ? "animate-sidebar-in" : "animate-sidebar-out"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 holographic rounded-full flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground">
                {processingDone ? "Identities Found" : "Processing..."}
              </h2>
              <p className="text-xs font-serif text-foreground/50">
                {processingDone
                  ? "3 identities are ready for you"
                  : "AI is analyzing your profile"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {!processingDone ? (
            <div className="flex flex-col gap-4">
              {/* Terminal-style script overlay */}
              <div className="bg-foreground/95 rounded-xl p-4 mb-4 font-mono text-xs text-green-400 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-foreground/40">
                  <Terminal size={12} />
                  <span>stagename.club — analysis engine</span>
                </div>
                <p className="text-foreground/30">$ scanning linguistic database...</p>
                <p className="text-green-400">
                  &gt; 4,217,893 name patterns indexed
                </p>
                <p className="text-foreground/30 mt-1">
                  $ matching against social platforms...
                </p>
                <p className="text-cyan-400">
                  &gt; checking spotify, apple music, instagram...
                </p>
                <p className="text-foreground/30 mt-1">
                  $ running vibe analysis on profile...
                </p>
                <p className="text-yellow-400">
                  &gt; {currentStage === 0 ? "analyzing" : "cross-referencing"}...
                  <span className="animate-pulse">█</span>
                </p>
              </div>

              {STAGES.map((stage, i) => {
                const isActive = i === currentStage;
                const isDone = i < currentStage || (i === currentStage && processingDone);

                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      {isDone ? (
                        <span className="text-green-500">✓</span>
                      ) : isActive ? (
                        <span className="stage-pulse">{stage.icon}</span>
                      ) : (
                        <span className="text-foreground/30">{stage.icon}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`font-serif text-sm transition-all duration-300 ${
                          isDone
                            ? "text-foreground font-semibold"
                            : isActive
                            ? "text-foreground font-semibold stage-active"
                            : "text-foreground/40"
                        }`}
                      >
                        {stage.label}
                      </p>

                      {isActive && !processingDone && (
                        <div className="mt-1.5 w-full bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="holographic h-1.5 rounded-full transition-all duration-100"
                            style={{ width: `${stageProgress * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Success header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 rounded-full px-4 py-1.5 text-xs font-serif uppercase tracking-wider mb-3">
                  <Check size={12} />
                  Analysis Complete
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">
                  We have found 3 available identities for you
                </h3>
                <p className="text-sm font-serif text-foreground/50 mt-1">
                  Where should we send your Kit?
                </p>
              </div>

              {/* Blurred result cards */}
              <div className="processing-blur flex flex-col gap-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white/60 border border-foreground/10 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-foreground/10" />
                      <p className="font-serif text-lg font-semibold text-foreground">
                        ████████ ██████
                      </p>
                    </div>
                    <p className="font-serif text-xs text-foreground/50">
                      AI-generated reason for this name...
                    </p>
                  </div>
                ))}
              </div>

              {/* Blurred image preview */}
              <div className="processing-blur flex gap-3">
                <div className="w-1/2 aspect-[3/4] bg-white/40 rounded-xl border border-foreground/10 flex items-center justify-center">
                  <span className="font-serif text-xs text-foreground/30">
                    Portrait
                  </span>
                </div>
                <div className="w-1/2 aspect-square bg-white/40 rounded-xl border border-foreground/10 flex items-center justify-center">
                  <span className="font-serif text-xs text-foreground/30">
                    Logo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Email gate */}
          {processingDone && !emailSent && (
            <div className="mt-auto">
              <div className="bg-white border-2 border-pink-accent/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={16} className="text-pink-accent" />
                  <h3 className="font-serif text-sm font-semibold text-foreground">
                    Enter your email to receive your Kit
                  </h3>
                </div>
                <p className="font-serif text-xs text-foreground/50 mb-4">
                  We&apos;ll send a secure link to unlock and pay for your brand
                  kit
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-full border-2 border-foreground/20 bg-beige px-4 py-2.5 text-foreground font-serif placeholder:text-foreground/40 focus:outline-none focus:border-pink-accent/50 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
                  />
                  <button
                    onClick={handleSendLink}
                    disabled={
                      !email.trim() || !email.includes("@") || sending
                    }
                    className={`rounded-full px-4 py-2.5 font-serif text-sm uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                      email.trim() && email.includes("@") && !sending
                        ? "holographic holographic-shadow text-white font-bold hover:scale-105"
                        : "border-2 border-foreground/10 text-foreground/30 cursor-not-allowed"
                    }`}
                  >
                    {sending ? (
                      <Loader2 size={14} className="ai-spinner" />
                    ) : (
                      <Mail size={14} />
                    )}
                    Send
                  </button>
                </div>
                {error && (
                  <p className="text-xs font-serif text-red-500 mt-2">
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Email sent confirmation */}
          {emailSent && (
            <div className="mt-auto">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-green-600" />
                </div>
                <h3 className="font-serif text-sm font-semibold text-foreground mb-1">
                  Check your inbox!
                </h3>
                <p className="font-serif text-xs text-foreground/50">
                  We&apos;ve sent a link to{" "}
                  <span className="font-semibold text-foreground/70">
                    {email}
                  </span>
                  . Click the link to unlock and pay for your Brand Kit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
