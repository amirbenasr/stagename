"use client";

import { useState, useRef, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import { mapQuizAnswers } from "../../lib/utils/quiz-utils";
import type { QuizAnswers, QuizQuestion, QuizAnswerValue } from "../../lib/types";

export function useQuiz(questions: QuizQuestion[]) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);

  const totalSteps = questions.length;
  const current = questions[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const isAnswered = useIsAnswered(current, answers);

  const canProceed = isAnswered || (current.type === "music" && !!current.optional);

  const goNext = useCallback(() => {
    if (!canProceed) return;
    if (step < totalSteps - 1) {
      setDirection("forward");
      setStep((s) => s + 1);
    }
  }, [step, totalSteps, canProceed]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection("back");
      setStep((s) => s - 1);
    }
  }, [step]);

  const goToStep = useCallback(
    (index: number) => {
      // Prevent jumping to another question unless current one is answered
      if (!canProceed) return;
      setDirection(index > step ? "forward" : "back");
      setStep(index);
    },
    [step, canProceed]
  );

  const setAnswer = useCallback(
    (id: string | number, value: QuizAnswerValue) => {
      setAnswers((prev) => ({ ...prev, [id as string]: value }));
    },
    []
  );

  const handleText = useCallback(
    (val: string) => setAnswer(current.id, val),
    [current.id, setAnswer]
  );

  const handleSingle = useCallback(
    (label: string) => setAnswer(current.id, label),
    [current.id, setAnswer]
  );

  const handleMulti = useCallback(
    (label: string) => {
      const existing = (answers[current.id as string] as string[]) || [];
      const next = existing.includes(label)
        ? existing.filter((l) => l !== label)
        : [...existing, label];
      setAnswer(current.id, next);
    },
    [current.id, answers, setAnswer]
  );

  const handleSelfie = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        setAnswer(current.id, { file, preview });
      }
    },
    [current.id, setAnswer]
  );

  const handleMusic = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAnswer(current.id, { file });
      }
    },
    [current.id, setAnswer]
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const textAnswers = mapQuizAnswers(answers);
      let selfieUrl = "";
      let musicUrl = "";

      for (const [key, val] of Object.entries(answers)) {
        if (val && typeof val === "object" && !Array.isArray(val) && val.file) {
          const timestamp = Date.now();
          if (key === "selfie") {
            const fileRef = ref(storage, `selfies/${timestamp}_selfie.jpg`);
            await uploadBytes(fileRef, val.file);
            selfieUrl = await getDownloadURL(fileRef);
          } else if (key === "music") {
            const fileRef = ref(storage, `music/${timestamp}_music.mp3`);
            await uploadBytes(fileRef, val.file);
            musicUrl = await getDownloadURL(fileRef);
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

      return docRef.id;
    } catch (err) {
      console.error("Submission failed:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [answers]);

  return {
    step,
    totalSteps,
    current,
    progress,
    answers,
    direction,
    isAnswered,
    canProceed,
    submitting,
    selfieRef,
    musicRef,
    goNext,
    goBack,
    goToStep,
    handleText,
    handleSingle,
    handleMulti,
    handleSelfie,
    handleMusic,
    handleSubmit,
  };
}

function useIsAnswered(
  current: QuizQuestion,
  answers: QuizAnswers
): boolean {
  const stepAnswer = answers[current.id as string];

  switch (current.type) {
    case "text":
      return typeof stepAnswer === "string" && stepAnswer.trim().length > 0;
    case "single":
      return typeof stepAnswer === "string" && stepAnswer !== "";
    case "multi":
      return Array.isArray(stepAnswer) && stepAnswer.length > 0;
    case "selfie":
      return (
        !!stepAnswer &&
        typeof stepAnswer === "object" &&
        !Array.isArray(stepAnswer) &&
        "file" in stepAnswer &&
        !!stepAnswer.file
      );
    case "music":
      return false;
    default:
      return false;
  }
}