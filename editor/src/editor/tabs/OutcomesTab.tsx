// Outcomes tab: defines the possible results the quiz can reveal (e.g. the
// destinations). Stored under the runtime's `destinations` key but labelled
// "Ziele/Ergebnisse" in the UI. At least two outcomes are required.

import type { QuizConfig } from '../../types';
import { addOutcome, updateOutcome, removeOutcome } from '../configOps';

interface Props {
  config: QuizConfig;
  onChange: (next: QuizConfig) => void;
}

export function OutcomesTab({ config, onChange }: Props) {
  const entries = Object.entries(config.destinations);
  const canRemove = entries.length > 2;

  return (
    <div className="tab-panel">
      <h2>Ergebnisse</h2>
      <p className="muted">
        Mögliche Ergebnisse des Quiz. Mindestens zwei werden benötigt.
      </p>

      {entries.map(([key, outcome]) => (
        <div className="card-block" key={key}>
          <div className="block-head">
            <input
              className="block-title"
              value={outcome.label}
              placeholder="Name des Ergebnisses"
              onChange={(e) => onChange(updateOutcome(config, key, { label: e.target.value }))}
            />
            <button
              className="danger"
              disabled={!canRemove}
              title={canRemove ? 'Ergebnis löschen' : 'Mindestens zwei nötig'}
              onClick={() => onChange(removeOutcome(config, key))}
            >
              Löschen
            </button>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Emoji</span>
              <input
                value={outcome.emoji ?? ''}
                onChange={(e) => onChange(updateOutcome(config, key, { emoji: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>Titel</span>
              <input
                value={outcome.title ?? ''}
                onChange={(e) => onChange(updateOutcome(config, key, { title: e.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            <span>Slogan</span>
            <input
              value={outcome.tagline ?? ''}
              onChange={(e) => onChange(updateOutcome(config, key, { tagline: e.target.value }))}
            />
          </label>

          <label className="field">
            <span>Details</span>
            <textarea
              rows={2}
              value={outcome.details ?? ''}
              onChange={(e) => onChange(updateOutcome(config, key, { details: e.target.value }))}
            />
          </label>
        </div>
      ))}

      <button className="btn btn-primary" onClick={() => onChange(addOutcome(config))}>
        + Ergebnis hinzufügen
      </button>
    </div>
  );
}
