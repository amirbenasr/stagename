// ============================================================
// Domain Types — Shared between server and client
// ============================================================

// --- Quiz & Submission ---

export interface QuizQuestionOption {
  label: string;
  emoji?: string;
}

export type QuizQuestionType = "text" | "single" | "multi" | "influences" | "selfie" | "music";

export interface QuizQuestion {
  id: string | number;
  type: QuizQuestionType;
  question: string;
  description?: string;
  placeholder?: string;
  optional?: boolean;
  options?: QuizQuestionOption[];
  genreKey?: string;
}

export type QuizAnswerValue = string | string[] | { file?: File; preview?: string };

export type QuizAnswers = Record<string, QuizAnswerValue>;

export type SemanticQuizAnswers = Record<string, string | string[]>;

export type SubmissionStatus = "pending" | "paid" | "complete";

export interface Submission {
  answers: SemanticQuizAnswers;
  selfieUrl: string;
  musicUrl: string;
  email: string | null;
  status: SubmissionStatus;
  paymentSessionId: string | null;
  brandKitSlug: string | null;
  createdAt: string;
}

// --- Stage Names ---

export interface StageNameResult {
  name: string;
  reason: string;
  model: string;
}

export interface NameGenerationStrategyConfig {
  model: string;
  creativeAngle: string;
  label: string;
}

// --- Platform Availability ---

export interface PlatformAvailability {
  available: boolean;
  handle: string | null;
}

export interface NameAvailability {
  spotify: PlatformAvailability;
  appleMusic: PlatformAvailability;
  instagram: PlatformAvailability;
  facebook: PlatformAvailability;
  domainCom: PlatformAvailability;
}

export type AvailabilityReport = Record<string, NameAvailability>;

export interface PlatformMeta {
  label: string;
  icon: string;
}

export const PLATFORM_LABELS: Record<string, PlatformMeta> = {
  spotify: { label: "Spotify", icon: "🎵" },
  appleMusic: { label: "Apple Music", icon: "🍎" },
  instagram: { label: "Instagram", icon: "📸" },
  facebook: { label: "Facebook", icon: "👤" },
  domainCom: { label: ".com Domain", icon: "🌐" },
};

// --- Brand Kit ---

export type BrandKitStatus = "complete" | "generating";

export interface NameAssetSet {
  name: string;
  reason: string;
  model: string;
  portraitImageUrl: string;
  logoImageUrl: string;
  studioPhotoUrl: string;
  availability: NameAvailability;
}

export interface BrandKitData {
  submissionId: string;
  slug: string;
  names: NameAssetSet[];
  genre: string;
  vibe: string;
  status: BrandKitStatus;
  createdAt: string;
}

// --- API DTOs ---

export interface CheckoutRequest {
  submissionId: string;
  email: string;
}

export interface CheckoutResponse {
  url?: string;
  error?: string;
}

export interface SendLinkRequest {
  submissionId: string;
  email: string;
}

export interface SessionLookupResponse {
  submissionId: string;
  status: SubmissionStatus;
  brandKitSlug: string | null;
}

export interface ClaimLookupResponse {
  submissionId: string;
  status: SubmissionStatus;
  email: string | null;
  brandKitSlug: string | null;
}

export interface GenerateRequest {
  submissionId: string;
}

// --- Image Generation ---

export type ImageGenerationType = "logo" | "studio" | "portrait";

export interface ImagePromptParams {
  stageName: string;
  genre?: string;
  vibe?: string;
}

export interface ImageGenerationRequest {
  type: ImageGenerationType;
  prompt: string;
  selfieUrl?: string;
  promptParams?: ImagePromptParams;
}

export interface ImageGenerationResult {
  url: string;
  type: ImageGenerationType;
}
