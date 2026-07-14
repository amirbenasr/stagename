"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import Logo from "../components/Logo";
import { useQuiz } from "./useQuiz";
import QuestionRenderer from "../components/QuestionRenderer";
import ProcessingSidebar from "../components/ProcessingSidebar";
import questionsData from "../../data/quiz-questions.json";
import genreInfluences from "../../data/genre-influences.json";
import type { QuizQuestion } from "../../lib/types";

const questions: QuizQuestion[] = questionsData as QuizQuestion[];

export default function QuizPage() {
  const quiz = useQuiz(questions);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const genreAnswer = quiz.answers["3"] as string | undefined;
  const influenceOptions = genreAnswer
    ? (genreInfluences as Record<string, string[]>)[genreAnswer] ?? []
    : [];

  const handleSubmit = async () => {
    const id = await quiz.handleSubmit();
    if (id) {
      setSubmissionId(id);
      setSidebarOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-beige text-foreground flex flex-col">
      <Navbar />

      <ProgressBar
        step={quiz.step}
        totalSteps={quiz.totalSteps}
        progress={quiz.progress}
        answers={quiz.answers}
        questions={questions}
        onStepClick={quiz.goToStep}
      />

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 flex-1">
        <div
          key={quiz.step}
          className={`transition-all duration-400 ${
            quiz.direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
          }`}
        >
          <QuestionRenderer
            question={quiz.current}
            answers={quiz.answers}
            selfieRef={quiz.selfieRef}
            musicRef={quiz.musicRef}
            onText={quiz.handleText}
            onSingle={quiz.handleSingle}
            onMulti={quiz.handleMulti}
            onSelfie={quiz.handleSelfie}
            onMusic={quiz.handleMusic}
            influenceOptions={influenceOptions}
          />
        </div>

        <Navigation
          step={quiz.step}
          totalSteps={quiz.totalSteps}
          canProceed={quiz.canProceed}
          submitting={quiz.submitting}
          onBack={quiz.goBack}
          onNext={quiz.goNext}
          onSubmit={handleSubmit}
        />
      </div>

      <ProcessingSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        submissionId={submissionId}
      />
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Navbar() {
  return (
    <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="block">
          <Logo className="h-8 w-auto" showTagline={false} />
        </Link>
        <Link
          href="/"
          className="text-sm font-serif text-foreground/50 hover:text-foreground transition"
        >
          ← Back to Home
        </Link>
      </div>
    </nav>
  );
}

function ProgressBar({
  step,
  totalSteps,
  progress,
  answers,
  questions,
  onStepClick,
}: {
  step: number;
  totalSteps: number;
  progress: number;
  answers: Record<string, unknown>;
  questions: QuizQuestion[];
  onStepClick: (index: number) => void;
}) {
  return (
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

      <div className="flex items-center justify-center gap-1 mt-4">
        {questions.map((q, i) => {
          const qAnswer = answers[q.id as string];
          const answered = isQuestionAnswered(q, qAnswer);
          return (
            <button
              key={q.id}
              onClick={() => onStepClick(i)}
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
  );
}

function Navigation({
  step,
  totalSteps,
  canProceed,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number;
  totalSteps: number;
  canProceed: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-12">
      <button
        onClick={onBack}
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
          onClick={onSubmit}
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
          onClick={onNext}
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
  );
}

function isQuestionAnswered(q: QuizQuestion, answer: unknown): boolean {
  if (!answer) return false;

  switch (q.type) {
    case "text":
      return typeof answer === "string" && answer.trim().length > 0;
    case "single":
      return typeof answer === "string" && answer !== "";
    case "multi":
    case "influences":
      return Array.isArray(answer) && answer.length > 0;
    case "selfie":
      return (
        typeof answer === "object" &&
        answer !== null &&
        !Array.isArray(answer) &&
        "file" in answer &&
        !!(answer as { file?: unknown }).file
      );
    case "music":
      return false;
    default:
      return false;
  }
}