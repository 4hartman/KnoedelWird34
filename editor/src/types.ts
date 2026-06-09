// Shared data types for the gift-quiz editor and the published runtime.
// The `QuizConfig` block is kept byte-compatible with the original
// questions.json schema consumed by the vanilla runtime (runtime/quiz.js),
// so the editor and the runtime never need to fork their data shape.

export interface OutcomeConfig {
  label: string;
  emoji?: string;
  title?: string;
  tagline?: string;
  details?: string;
}

export interface OptionConfig {
  id: string;
  text?: string;
  image?: string;
  alt?: string;
  points?: Record<string, number>;
  winner?: string;
}

export interface QuestionConfig {
  id: string;
  question: string;
  hint?: string;
  options: OptionConfig[];
}

export interface TiebreakerConfig {
  id: string;
  question: string;
  options: OptionConfig[];
}

export interface QuizMeta {
  recipient: string;
  occasion: string;
  voteBarEnabled: boolean;
}

export interface QuizIntro {
  greeting: string;
  subtitle: string;
  buttonText: string;
}

export interface QuizConfig {
  meta: QuizMeta;
  intro: QuizIntro;
  destinations: Record<string, OutcomeConfig>;
  questions: QuestionConfig[];
  tiebreaker?: TiebreakerConfig | null;
}

export interface ThemeConfig {
  palette: {
    primary: string;
    accent: string;
    text: string;
    card: string;
  };
  backgroundCss: string;
  backgroundImage?: string;
  font: string;
  headingFont: string;
}

export interface Project {
  id: string;
  ownerUid: string;
  slug?: string;
  published: boolean;
  title: string;
  theme: ThemeConfig;
  config: QuizConfig;
  createdAt?: unknown;
  updatedAt?: unknown;
}
