// Pure, immutable helpers for editing a QuizConfig. The editor components call
// these and feed the result into setConfig, keeping mutation logic out of the
// React components and easy to reason about.

import type {
  QuizConfig,
  QuestionConfig,
  OptionConfig,
  OutcomeConfig,
} from '../types';
import { makeId } from '../lib/templates';

export function updateMeta(
  config: QuizConfig,
  patch: Partial<QuizConfig['meta']>,
): QuizConfig {
  return { ...config, meta: { ...config.meta, ...patch } };
}

export function updateIntro(
  config: QuizConfig,
  patch: Partial<QuizConfig['intro']>,
): QuizConfig {
  return { ...config, intro: { ...config.intro, ...patch } };
}

// ─── Outcomes (stored under the `destinations` key for runtime compatibility) ──

export function addOutcome(config: QuizConfig): QuizConfig {
  const key = makeId('o');
  const count = Object.keys(config.destinations).length + 1;
  return {
    ...config,
    destinations: {
      ...config.destinations,
      [key]: { label: `Ziel ${count}`, emoji: '🎁', title: 'Überraschung!' },
    },
  };
}

export function updateOutcome(
  config: QuizConfig,
  key: string,
  patch: Partial<OutcomeConfig>,
): QuizConfig {
  return {
    ...config,
    destinations: {
      ...config.destinations,
      [key]: { ...config.destinations[key], ...patch },
    },
  };
}

export function removeOutcome(config: QuizConfig, key: string): QuizConfig {
  const destinations = { ...config.destinations };
  delete destinations[key];
  // Strip references to the removed outcome from option points and winners.
  const questions = config.questions.map((q) => ({
    ...q,
    options: q.options.map((o) => stripOutcomeFromOption(o, key)),
  }));
  const tiebreaker = config.tiebreaker
    ? {
        ...config.tiebreaker,
        options: config.tiebreaker.options.map((o) =>
          o.winner === key ? { ...o, winner: undefined } : o,
        ),
      }
    : config.tiebreaker;
  return { ...config, destinations, questions, tiebreaker };
}

function stripOutcomeFromOption(o: OptionConfig, key: string): OptionConfig {
  if (!o.points || !(key in o.points)) return o;
  const points = { ...o.points };
  delete points[key];
  return { ...o, points };
}

// ─── Questions ────────────────────────────────────────────────────────────

export function addQuestion(config: QuizConfig): QuizConfig {
  const q: QuestionConfig = {
    id: makeId('q'),
    question: 'Neue Frage?',
    options: [
      { id: makeId('a'), text: 'Antwort A' },
      { id: makeId('a'), text: 'Antwort B' },
    ],
  };
  return { ...config, questions: [...config.questions, q] };
}

export function updateQuestion(
  config: QuizConfig,
  index: number,
  patch: Partial<QuestionConfig>,
): QuizConfig {
  const questions = config.questions.slice();
  questions[index] = { ...questions[index], ...patch };
  return { ...config, questions };
}

export function removeQuestion(config: QuizConfig, index: number): QuizConfig {
  return { ...config, questions: config.questions.filter((_, i) => i !== index) };
}

export function moveQuestion(
  config: QuizConfig,
  from: number,
  to: number,
): QuizConfig {
  if (to < 0 || to >= config.questions.length) return config;
  const questions = config.questions.slice();
  const [item] = questions.splice(from, 1);
  questions.splice(to, 0, item);
  return { ...config, questions };
}

// ─── Options within a question ──────────────────────────────────────────────

export function addOption(config: QuizConfig, qIndex: number): QuizConfig {
  const questions = config.questions.slice();
  const q = questions[qIndex];
  questions[qIndex] = {
    ...q,
    options: [...q.options, { id: makeId('a'), text: 'Neue Antwort' }],
  };
  return { ...config, questions };
}

export function updateOption(
  config: QuizConfig,
  qIndex: number,
  oIndex: number,
  patch: Partial<OptionConfig>,
): QuizConfig {
  const questions = config.questions.slice();
  const q = questions[qIndex];
  const options = q.options.slice();
  options[oIndex] = { ...options[oIndex], ...patch };
  questions[qIndex] = { ...q, options };
  return { ...config, questions };
}

export function removeOption(
  config: QuizConfig,
  qIndex: number,
  oIndex: number,
): QuizConfig {
  const questions = config.questions.slice();
  const q = questions[qIndex];
  questions[qIndex] = { ...q, options: q.options.filter((_, i) => i !== oIndex) };
  return { ...config, questions };
}

// Set how many points an option awards to a given outcome (0 removes it).
export function setOptionPoints(
  config: QuizConfig,
  qIndex: number,
  oIndex: number,
  outcomeKey: string,
  points: number,
): QuizConfig {
  const questions = config.questions.slice();
  const q = questions[qIndex];
  const options = q.options.slice();
  const current = { ...(options[oIndex].points ?? {}) };
  if (points > 0) current[outcomeKey] = points;
  else delete current[outcomeKey];
  options[oIndex] = {
    ...options[oIndex],
    points: Object.keys(current).length ? current : undefined,
  };
  questions[qIndex] = { ...q, options };
  return { ...config, questions };
}

// ─── Tiebreaker ───────────────────────────────────────────────────────────

export function setTiebreakerEnabled(
  config: QuizConfig,
  enabled: boolean,
): QuizConfig {
  if (!enabled) return { ...config, tiebreaker: null };
  if (config.tiebreaker) return config;
  const keys = Object.keys(config.destinations);
  return {
    ...config,
    tiebreaker: {
      id: makeId('tb'),
      question: 'Unentschieden! Was gibt den Ausschlag?',
      options: keys.slice(0, 2).map((k, i) => ({
        id: makeId('t'),
        text: `Option ${i + 1}`,
        winner: k,
      })),
    },
  };
}

export function updateTiebreakerQuestion(
  config: QuizConfig,
  question: string,
): QuizConfig {
  if (!config.tiebreaker) return config;
  return { ...config, tiebreaker: { ...config.tiebreaker, question } };
}

export function updateTiebreakerOption(
  config: QuizConfig,
  oIndex: number,
  patch: Partial<OptionConfig>,
): QuizConfig {
  if (!config.tiebreaker) return config;
  const options = config.tiebreaker.options.slice();
  options[oIndex] = { ...options[oIndex], ...patch };
  return { ...config, tiebreaker: { ...config.tiebreaker, options } };
}
