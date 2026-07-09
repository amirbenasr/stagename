---
name: quiz-influences-pattern
description: Dynamic quiz question pattern where options depend on a previous answer (genre → genre-specific artist influences), with multi-select + custom text input
source: auto-skill
extracted_at: '2026-07-09T16:48:15.219Z'
---

## Pattern: Dynamic Quiz Questions with Genre-Specific Options

When a quiz question's options depend on a previous answer (e.g., genre selection determines which artists to show), use this pattern:

### 1. Separate dynamic data from quiz structure

Store genre-specific options in a separate JSON file keyed by the same labels used in the quiz:

```json
// data/genre-influences.json
{
  "Hip-Hop": ["Kendrick Lamar", "Drake", ...],
  "R&B": ["SZA", "Frank Ocean", ...]
}
```

Keys must **exactly match** the option labels from the controlling question.

### 2. Define a new question type in the JSON

```json
{
  "id": 3,
  "type": "influences",
  "question": "Which artists influence your sound?",
  "genreKey": "2"
}
```

The `genreKey` points to the controlling question's ID.

### 3. Register the type in `lib/types.ts`

```typescript
export type QuizQuestionType = "text" | "single" | "multi" | "influences" | "selfie" | "music";

interface QuizQuestion {
  // ...existing fields
  genreKey?: string;  // for dynamic questions
}
```

### 4. Compute dynamic options in the quiz page

```typescript
const genreAnswer = quiz.answers["2"] as string | undefined;
const influenceOptions = genreAnswer
  ? genreInfluences[genreAnswer] ?? []
  : [];

<QuestionRenderer influenceOptions={influenceOptions} />
```

### 5. Render with a custom component that supports both selection and custom input

The `InfluencesSelect` component shows:
- A multi-select grid of genre-specific options
- A text input + "+" button for custom entries
- Both feed into the same `onToggle` handler → unified `string[]` answer

### 6. Wire through the pipeline

- **`isQuestionAnswered` / `useIsAnswered`**: treat `"influences"` like `"multi"` (check `Array.isArray && length > 0`)
- **`QUIZ_KEY_MAP`**: map the question ID to a semantic key (e.g., `"3" → "influences"`)
- **`buildArtistContext`**: include the influences in the artist context string
- **AI prompts**: reference influences explicitly so the model uses them

## Files changed
- `data/genre-influences.json` — genre → artist lists
- `data/quiz-questions.json` — new `"influences"` type question
- `lib/types.ts` — new type + `genreKey` field
- `app/components/QuestionRenderer.tsx` — `InfluencesSelect` component
- `app/quiz/page.tsx` — computes `influenceOptions` from genre answer
- `app/quiz/useQuiz.ts` — `"influences"` in answer validation
- `lib/utils/quiz-utils.ts` — key mapping + context builder
- `lib/ai/prompt-builders.ts` — AI prompt references influences
- `lib/services/generation-service.ts` — format label for influences
