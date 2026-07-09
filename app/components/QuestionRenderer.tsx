"use client";

import { useState } from "react";
import { Camera, Music, Upload, Check, Plus } from "lucide-react";
import type { QuizQuestion, QuizAnswers, QuizAnswerValue } from "../../lib/types";

interface QuestionRendererProps {
  question: QuizQuestion;
  answers: QuizAnswers;
  selfieRef: React.RefObject<HTMLInputElement | null>;
  musicRef: React.RefObject<HTMLInputElement | null>;
  onText: (val: string) => void;
  onSingle: (label: string) => void;
  onMulti: (label: string) => void;
  onSelfie: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMusic: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Dynamic options for influences question (genre-specific) */
  influenceOptions?: string[];
}

interface FileAnswer {
  file?: File;
  preview?: string;
}

function getFileAnswer(value: QuizAnswerValue): FileAnswer | null {
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null &&
    "file" in value
  ) {
    return value as FileAnswer;
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes > 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function QuestionRenderer({
  question,
  answers,
  selfieRef,
  musicRef,
  onText,
  onSingle,
  onMulti,
  onSelfie,
  onMusic,
  influenceOptions = [],
}: QuestionRendererProps) {
  const answer = answers[question.id as string];

  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-2">
        {question.question}
      </h2>
      {question.description && (
        <p className="text-sm font-serif text-foreground/50">{question.description}</p>
      )}

      <div className="mt-8">
        {question.type === "text" && (
          <TextInput value={answer} onChange={onText} placeholder={question.placeholder} />
        )}

        {question.type === "single" && (
          <SingleSelect
            options={question.options ?? []}
            selected={answer}
            onSelect={onSingle}
          />
        )}

        {question.type === "multi" && (
          <MultiSelect
            options={question.options ?? []}
            selected={answer}
            onToggle={onMulti}
          />
        )}

        {question.type === "influences" && (
          <InfluencesSelect
            options={influenceOptions}
            selected={answer}
            onToggle={onMulti}
          />
        )}

        {question.type === "selfie" && (
          <SelfieUpload
            answer={getFileAnswer(answer)}
            inputRef={selfieRef}
            onChange={onSelfie}
          />
        )}

        {question.type === "music" && (
          <MusicUpload
            answer={getFileAnswer(answer)}
            inputRef={musicRef}
            onChange={onMusic}
            optional={question.optional}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Question Type Renderers (Strategy implementations)
// ============================================================

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: QuizAnswerValue;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex justify-center">
      <input
        type="text"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Type your answer..."}
        className="w-64 sm:w-80 rounded-full border-2 border-foreground/20 bg-white px-6 py-3 text-foreground font-serif placeholder:text-foreground/40 focus:outline-none focus:border-pink-accent/50 transition text-center text-lg"
        autoFocus
      />
    </div>
  );
}

function SingleSelect({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; emoji?: string }[];
  selected: QuizAnswerValue;
  onSelect: (label: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((opt) => {
        const isSelected = selected === opt.label;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.label)}
            className={`py-3 px-4 rounded-xl border-2 font-serif transition-all duration-300 flex items-center justify-center gap-2 ${
              isSelected
                ? "border-pink-accent bg-pink-accent/10 text-pink-accent shadow-md"
                : "border-foreground/10 bg-white/50 text-foreground/60 hover:border-pink-accent/30 hover:bg-pink-accent/5"
            }`}
          >
            {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
            <span className="text-sm">{opt.label}</span>
            {isSelected && <Check size={14} className="ml-1" />}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: { label: string }[];
  selected: QuizAnswerValue;
  onToggle: (label: string) => void;
}) {
  const selectedList = (Array.isArray(selected) ? selected : []) as string[];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {options.map((opt) => {
        const isSelected = selectedList.includes(opt.label);
        return (
          <button
            key={opt.label}
            onClick={() => onToggle(opt.label)}
            className={`py-3 px-4 rounded-xl border-2 font-serif transition-all duration-300 flex items-center justify-center gap-2 ${
              isSelected
                ? "border-cyan-accent bg-cyan-accent/10 text-cyan-accent shadow-md"
                : "border-foreground/10 bg-white/50 text-foreground/60 hover:border-cyan-accent/30 hover:bg-cyan-accent/5"
            }`}
          >
            <span className="text-sm">{opt.label}</span>
            {isSelected && <Check size={14} className="ml-1" />}
          </button>
        );
      })}
    </div>
  );
}

function InfluencesSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: QuizAnswerValue;
  onToggle: (label: string) => void;
}) {
  const [customValue, setCustomValue] = useState("");
  const selectedList = (Array.isArray(selected) ? selected : []) as string[];

  const handleAddCustom = () => {
    const trimmed = customValue.trim();
    if (trimmed && !selectedList.includes(trimmed)) {
      onToggle(trimmed);
      setCustomValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((artist) => {
          const isSelected = selectedList.includes(artist);
          return (
            <button
              key={artist}
              onClick={() => onToggle(artist)}
              className={`py-3 px-4 rounded-xl border-2 font-serif transition-all duration-300 flex items-center justify-center gap-2 ${
                isSelected
                  ? "border-cyan-accent bg-cyan-accent/10 text-cyan-accent shadow-md"
                  : "border-foreground/10 bg-white/50 text-foreground/60 hover:border-cyan-accent/30 hover:bg-cyan-accent/5"
              }`}
            >
              <span className="text-sm">{artist}</span>
              {isSelected && <Check size={14} className="ml-1" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 justify-center">
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Or type an artist name..."
          className="w-56 rounded-full border-2 border-foreground/20 bg-white px-5 py-2.5 text-foreground font-serif placeholder:text-foreground/40 focus:outline-none focus:border-cyan-accent/50 transition text-sm text-center"
        />
        <button
          onClick={handleAddCustom}
          disabled={!customValue.trim()}
          className={`rounded-full p-2.5 border-2 transition-all duration-300 ${
            customValue.trim()
              ? "border-cyan-accent bg-cyan-accent/10 text-cyan-accent hover:bg-cyan-accent hover:text-white"
              : "border-foreground/10 text-foreground/20 cursor-not-allowed"
          }`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function SelfieUpload({
  answer,
  inputRef,
  onChange,
}: {
  answer: FileAnswer | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {answer?.preview ? (
        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-pink-accent/30 shadow-xl">
          <img
            src={answer.preview}
            alt="Your selfie"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 holographic opacity-10 rounded-full" />
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-48 h-48 rounded-full border-2 border-dashed border-foreground/20 bg-white/50 flex flex-col items-center justify-center gap-3 hover:border-pink-accent/40 hover:bg-pink-accent/5 transition-all duration-300"
        >
          <Camera size={32} className="text-foreground/40" />
          <span className="text-sm font-serif text-foreground/40">Upload Selfie</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
      {answer?.preview && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm font-serif text-pink-accent hover:underline transition"
        >
          Change photo
        </button>
      )}
    </div>
  );
}

function MusicUpload({
  answer,
  inputRef,
  onChange,
  optional,
}: {
  answer: FileAnswer | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {answer?.file ? (
        <div className="bg-white/60 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <Music size={24} className="text-cyan-accent" />
          <div>
            <span className="text-sm font-serif text-foreground font-semibold">
              {answer.file.name}
            </span>
            <span className="text-xs font-serif text-foreground/40 block">
              {formatFileSize(answer.file.size)}
            </span>
          </div>
          <Check size={16} className="text-green-500 ml-2" />
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-64 h-32 rounded-2xl border-2 border-dashed border-foreground/20 bg-white/50 flex flex-col items-center justify-center gap-3 hover:border-cyan-accent/40 hover:bg-cyan-accent/5 transition-all duration-300"
        >
          <Upload size={24} className="text-foreground/40" />
          <span className="text-sm font-serif text-foreground/40">Upload Audio Snippet</span>
          <span className="text-xs font-serif text-foreground/30">MP3, WAV, or OGG</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={onChange}
        className="hidden"
      />
      {optional && !answer?.file && (
        <span className="text-xs font-serif text-foreground/30 italic">
          This step is optional — skip if you want
        </span>
      )}
      {answer?.file && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm font-serif text-cyan-accent hover:underline transition"
        >
          Change file
        </button>
      )}
    </div>
  );
}