"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Star, ArrowLeft, ArrowRight, Check, Upload, Music, Camera, Sparkles, Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import ProcessingSidebar from "../components/ProcessingSidebar";
import questionsData from "../../data/quiz-questions.json";

interface QuestionOption {
  label: string;
  emoji?: string;
}

interface Question {
  id: string | number;
  type: "text" | "single" | "multi" | "selfie" | "music";
  question: string;
  description?: string;
  placeholder?: string;
  optional?: boolean;
  options?: QuestionOption[];
}

const questions: Question[] = questionsData as Question[];

type Answers = Record<string, string | string[] | { file?: File; preview?: string }>;

const KEY_MAP: Record<string, string> = {
  "1": "artistName",
  "2": "genre",
  "3": "origin",
  "4": "platforms",
  "5": "vibe",
  "6": "persona",
  "7": "drive",
  "8": "visualWorld",
  "9": "languages",
};

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);

  const totalSteps = questions.length;
  const current = questions[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const stepAnswer = answers[current.id as string];
  const isAnswered = current.type === "text"
    ? typeof stepAnswer === "string" && stepAnswer.trim().length > 0
    : current.type === "single"
    ? typeof stepAnswer === "string" && stepAnswer !== ""
    : current.type === "multi"
    ? Array.isArray(stepAnswer) && stepAnswer.length > 0
    : current.type === "selfie"
    ? !!stepAnswer && typeof stepAnswer === "object" && !Array.isArray(stepAnswer) && !!stepAnswer.file
    : true; // music is optional

  const canProceed = isAnswered || (current.type === "music" && current.optional);

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection("forward");
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection("back");
      setStep(step - 1);
    }
  };

  const handleText = (val: string) => {
    setAnswers({ ...answers, [current.id]: val });
  };

  const handleSingle = (label: string) => {
    setAnswers({ ...answers, [current.id]: label });
  };

  const handleMulti = (label: string) => {
    const existing = (answers[current.id] as string[]) || [];
    const next = existing.includes(label)
      ? existing.filter((l) => l !== label)
      : [...existing, label];
    setAnswers({ ...answers, [current.id]: next });
  };

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setAnswers({ ...answers, [current.id]: { file, preview } });
    }
  };

  const handleMusic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnswers({ ...answers, [current.id]: { file } });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const textAnswers: Record<string, string | string[]> = {};
      let selfieUrl = "";
      let musicUrl = "";

      for (const [key, val] of Object.entries(answers)) {
        const mappedKey = KEY_MAP[key] || key;
        if (typeof val === "string") {
          textAnswers[mappedKey] = val;
        } else if (Array.isArray(val)) {
          textAnswers[mappedKey] = val;
        } else if (val && typeof val === "object" && val.file) {
          if (key === "selfie") {
            const timestamp = Date.now();
            const selfieStorageRef = ref(storage, `selfies/${timestamp}_selfie.jpg`);
            await uploadBytes(selfieStorageRef, val.file);
            selfieUrl = await getDownloadURL(selfieStorageRef);
          } else if (key === "music") {
            const timestamp = Date.now();
            const musicStorageRef = ref(storage, `music/${timestamp}_music.mp3`);
            await uploadBytes(musicStorageRef, val.file);
            musicUrl = await getDownloadURL(musicStorageRef);
          }
        }
      }

      const docRef = await addDoc(collection(db, "submissions"), {
        answers: textAnswers,
        selfieUrl,
        musicUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSubmissionId(docRef.id);
      setSidebarOpen(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige text-foreground flex flex-col">
      {/* ===== NAVBAR ===== */}
      <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Star size={14} className="text-foreground" />
            <span className="text-lg font-serif lowercase tracking-wide">stagename.club</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-serif text-foreground/50 hover:text-foreground transition"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* ===== PROGRESS INDICATOR ===== */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-serif uppercase tracking-[0.3em] text-pink-accent">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="text-xs font-serif text-foreground/40">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2 shadow-sm">
          <div
            className="holographic h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {questions.map((q, i) => {
            const qAnswer = answers[q.id as string];
            const answered = q.type === "text"
              ? typeof qAnswer === "string" && qAnswer.trim().length > 0
              : q.type === "single"
              ? typeof qAnswer === "string" && qAnswer !== ""
              : q.type === "multi"
              ? Array.isArray(qAnswer) && qAnswer.length > 0
              : q.type === "selfie"
              ? !!qAnswer && typeof qAnswer === "object" && !Array.isArray(qAnswer) && !!qAnswer.file
              : false; // music is optional, show unanswered by default
            return (
              <button
                key={q.id}
                onClick={() => { setDirection(i > step ? "forward" : "back"); setStep(i); }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  i === step
                    ? "border-pink-accent bg-pink-accent/10 scale-110"
                    : answered
                    ? "border-green-500 bg-green-500/10"
                    : "border-foreground/15 bg-white"
                }`}
              >
                {answered && i !== step ? (
                  <Check size={14} className="text-green-500" />
                ) : i === step ? (
                  <Sparkles size={14} className="text-pink-accent" />
                ) : (
                  <span className="text-xs font-serif text-foreground/30">{i + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== QUESTION AREA ===== */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 flex-1">
        <div
          key={step}
          className={`transition-all duration-400 ${
            direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
          }`}
        >
          {/* Question header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-2">
              {current.question}
            </h2>
            {current.description && (
              <p className="text-sm font-serif text-foreground/50">{current.description}</p>
            )}
          </div>

          {/* ===== TEXT INPUT ===== */}
          {current.type === "text" && (
            <div className="flex justify-center">
              <input
                type="text"
                value={(answers[current.id] as string) || ""}
                onChange={(e) => handleText(e.target.value)}
                placeholder={current.placeholder || "Type your answer..."}
                className="w-64 sm:w-80 rounded-full border-2 border-foreground/20 bg-white px-6 py-3 text-foreground font-serif placeholder:text-foreground/40 focus:outline-none focus:border-pink-accent/50 transition text-center text-lg"
                autoFocus
              />
            </div>
          )}

          {/* ===== SINGLE SELECT ===== */}
          {current.type === "single" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {current.options?.map((opt) => {
                const selected = answers[current.id] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSingle(opt.label)}
                    className={`py-3 px-4 rounded-xl border-2 font-serif transition-all duration-300 flex items-center justify-center gap-2 ${
                      selected
                        ? "border-pink-accent bg-pink-accent/10 text-pink-accent shadow-md"
                        : "border-foreground/10 bg-white/50 text-foreground/60 hover:border-pink-accent/30 hover:bg-pink-accent/5"
                    }`}
                  >
                    {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
                    <span className="text-sm">{opt.label}</span>
                    {selected && <Check size={14} className="ml-1" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ===== MULTI SELECT ===== */}
          {current.type === "multi" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {current.options?.map((opt) => {
                const selected = ((answers[current.id] as string[]) || []).includes(opt.label);
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleMulti(opt.label)}
                    className={`py-3 px-4 rounded-xl border-2 font-serif transition-all duration-300 flex items-center justify-center gap-2 ${
                      selected
                        ? "border-cyan-accent bg-cyan-accent/10 text-cyan-accent shadow-md"
                        : "border-foreground/10 bg-white/50 text-foreground/60 hover:border-cyan-accent/30 hover:bg-cyan-accent/5"
                    }`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    {selected && <Check size={14} className="ml-1" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ===== SELFIE UPLOAD ===== */}
          {current.type === "selfie" && (
            <div className="flex flex-col items-center gap-6">
              {answers[current.id] && typeof answers[current.id] === "object" && (answers[current.id] as any).preview ? (
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-pink-accent/30 shadow-xl">
                  <img
                    src={(answers[current.id] as any).preview}
                    alt="Your selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 holographic opacity-10 rounded-full" />
                </div>
              ) : (
                <button
                  onClick={() => selfieRef.current?.click()}
                  className="w-48 h-48 rounded-full border-2 border-dashed border-foreground/20 bg-white/50 flex flex-col items-center justify-center gap-3 hover:border-pink-accent/40 hover:bg-pink-accent/5 transition-all duration-300"
                >
                  <Camera size={32} className="text-foreground/40" />
                  <span className="text-sm font-serif text-foreground/40">Upload Selfie</span>
                </button>
              )}
              <input
                ref={selfieRef}
                type="file"
                accept="image/*"
                onChange={handleSelfie}
                className="hidden"
              />
              {answers[current.id] && typeof answers[current.id] === "object" && (answers[current.id] as any).preview && (
                <button
                  onClick={() => selfieRef.current?.click()}
                  className="text-sm font-serif text-pink-accent hover:underline transition"
                >
                  Change photo
                </button>
              )}
            </div>
          )}

          {/* ===== MUSIC UPLOAD ===== */}
          {current.type === "music" && (
            <div className="flex flex-col items-center gap-6">
              {answers[current.id] && typeof answers[current.id] === "object" && (answers[current.id] as any).file ? (
                <div className="bg-white/60 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
                  <Music size={24} className="text-cyan-accent" />
                  <div>
                    <span className="text-sm font-serif text-foreground font-semibold">
                      {(answers[current.id] as any).file.name}
                    </span>
                    <span className="text-xs font-serif text-foreground/40 block">
                      {(answers[current.id] as any).file.size > 1024 * 1024
                        ? `${((answers[current.id] as any).file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${((answers[current.id] as any).file.size / 1024).toFixed(0)} KB`}
                    </span>
                  </div>
                  <Check size={16} className="text-green-500 ml-2" />
                </div>
              ) : (
                <button
                  onClick={() => musicRef.current?.click()}
                  className="w-64 h-32 rounded-2xl border-2 border-dashed border-foreground/20 bg-white/50 flex flex-col items-center justify-center gap-3 hover:border-cyan-accent/40 hover:bg-cyan-accent/5 transition-all duration-300"
                >
                  <Upload size={24} className="text-foreground/40" />
                  <span className="text-sm font-serif text-foreground/40">Upload Audio Snippet</span>
                  <span className="text-xs font-serif text-foreground/30">MP3, WAV, or OGG</span>
                </button>
              )}
              <input
                ref={musicRef}
                type="file"
                accept="audio/*"
                onChange={handleMusic}
                className="hidden"
              />
              {current.optional && !(answers[current.id] && typeof answers[current.id] === "object" && (answers[current.id] as any).file) && (
                <span className="text-xs font-serif text-foreground/30 italic">This step is optional — skip if you want</span>
              )}
              {answers[current.id] && typeof answers[current.id] === "object" && (answers[current.id] as any).file && (
                <button
                  onClick={() => musicRef.current?.click()}
                  className="text-sm font-serif text-cyan-accent hover:underline transition"
                >
                  Change file
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== NAVIGATION ===== */}
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={goBack}
            disabled={step === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-serif uppercase tracking-wider text-sm transition-all duration-300 ${
              step === 0
                ? "border-foreground/10 text-foreground/20 cursor-not-allowed"
                : "border-foreground/20 text-foreground/60 hover:border-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {step === totalSteps - 1 && canProceed ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`holographic holographic-shadow rounded-full px-6 py-3 text-white font-serif uppercase tracking-wider text-sm font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="ai-spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate My Stage Name
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-serif uppercase tracking-wider text-sm transition-all duration-300 ${
                canProceed
                  ? "border-pink-accent bg-pink-accent/10 text-pink-accent hover:bg-pink-accent hover:text-white"
                  : "border-foreground/10 text-foreground/20 cursor-not-allowed"
              }`}
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ===== PROCESSING SIDEBAR ===== */}
      <ProcessingSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        submissionId={submissionId}
      />
    </div>
  );
}
