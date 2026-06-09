// Validates a quiz config before publishing. Returns human-readable problems;
// an empty array means the gift is ready to publish. Mirrors the runtime's
// expectations: at least two outcomes, real questions with answers, and every
// outcome actually reachable so no result is a dead end.

import type { QuizConfig } from '../types';

export function validateConfig(config: QuizConfig): string[] {
  const errors: string[] = [];
  const outcomeKeys = Object.keys(config.destinations);

  if (outcomeKeys.length < 2) {
    errors.push('Mindestens zwei Ergebnisse werden benötigt.');
  }
  outcomeKeys.forEach((k) => {
    if (!config.destinations[k].label.trim()) {
      errors.push('Jedes Ergebnis braucht einen Namen.');
    }
  });

  if (config.questions.length === 0) {
    errors.push('Mindestens eine Frage wird benötigt.');
  }
  config.questions.forEach((q, i) => {
    if (!q.question.trim()) errors.push(`Frage ${i + 1} hat keinen Text.`);
    if (q.options.length < 2) errors.push(`Frage ${i + 1} braucht mindestens zwei Antworten.`);
    q.options.forEach((o) => {
      if (!o.text?.trim() && !o.image) {
        errors.push(`Eine Antwort in Frage ${i + 1} hat weder Text noch Bild.`);
      }
    });
  });

  // Every outcome should be reachable via points or as a tiebreaker winner.
  const reachable = new Set<string>();
  config.questions.forEach((q) =>
    q.options.forEach((o) => {
      Object.keys(o.points ?? {}).forEach((k) => reachable.add(k));
    }),
  );
  config.tiebreaker?.options.forEach((o) => {
    if (o.winner) reachable.add(o.winner);
  });
  outcomeKeys.forEach((k) => {
    if (!reachable.has(k)) {
      errors.push(
        `Das Ergebnis „${config.destinations[k].label}" kann nie gewinnen — vergib Punkte dafür.`,
      );
    }
  });

  if (config.tiebreaker) {
    const withoutWinner = config.tiebreaker.options.some((o) => !o.winner);
    if (withoutWinner) errors.push('Jede Stichfragen-Antwort braucht ein Gewinner-Ergebnis.');
  }

  return [...new Set(errors)];
}
