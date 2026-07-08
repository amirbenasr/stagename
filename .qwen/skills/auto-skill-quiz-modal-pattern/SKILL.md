---
name: quiz-modal-pattern
description: Pattern for implementing an interactive CTA button that opens a quiz/trivia modal backed by a JSON data file, with score tracking and a final CTA redirect
source: auto-skill
extracted_at: '2026-07-06T15:29:35.999Z'
---

## Quiz Modal with JSON-backed Trivia

When the user wants a clickable element (button, icon, heart) that opens a quiz/trivia popup:

### Architecture

1. **Separate JSON data file** (`data/questions.json`) — keeps questions editable without touching React code. Each question has `id`, `question`, `options` (array of strings), and `correct` (0-based index of correct answer). Easy to extend or swap out for a different topic.

2. **Standalone modal component** (`app/components/QuizModal.tsx`) — accepts `isOpen`, `onClose`, `onComplete` props. Manages its own state: current question index, selected answer, score, and finished state. This keeps the quiz logic isolated from the page.

3. **Page integration** — Parent page holds `quizOpen` (boolean) and `quizCompleted` (boolean) state. The CTA button calls `setQuizOpen(true)`. The modal's `onComplete` callback can trigger a follow-up action (e.g., scrolling to the upload form).

### Modal UX flow

- Progress bar showing current question / total
- Options highlight green (correct) or red (wrong) on selection, other options dim
- "Next Question" button appears only after answering
- Final screen shows score with tiered messaging (≥7: expert, ≥4: decent, <4: needs a name more than ever)
- Final CTA button links to the main product action

### Design notes

- Dark theme: `bg-gradient-to-b from-slate-950 to-black`, purple/emerald accent gradients
- `backdrop-blur-sm` overlay for the modal background
- `animate-in` class on modal container for entrance animation
- Social media icons (Spotify, Instagram, TikTok) rendered as inline SVGs in the hero — no external icon dependency needed for brand logos
