// Questions tab: the core editing surface. Each question has text, an optional
// hint, and 2+ options. Every option can award points to any outcome(s); an
// option with no points is a "fun question" answer that doesn't affect scoring.
// Questions can be reordered. An optional tiebreaker resolves score ties by
// directly assigning a winning outcome per option.

import type { QuizConfig } from '../../types';
import { ImageUpload } from '../ImageUpload';
import {
  addQuestion,
  updateQuestion,
  removeQuestion,
  moveQuestion,
  addOption,
  updateOption,
  removeOption,
  setOptionPoints,
  setTiebreakerEnabled,
  updateTiebreakerQuestion,
  updateTiebreakerOption,
} from '../configOps';

interface Props {
  config: QuizConfig;
  onChange: (next: QuizConfig) => void;
  uid: string;
  projectId: string;
}

export function QuestionsTab({ config, onChange, uid, projectId }: Props) {
  const outcomes = Object.entries(config.destinations);

  return (
    <div className="tab-panel">
      <h2>Fragen</h2>

      {config.questions.map((q, qi) => (
        <div className="card-block" key={q.id}>
          <div className="block-head">
            <span className="step-label">Frage {qi + 1}</span>
            <div className="reorder">
              <button disabled={qi === 0} onClick={() => onChange(moveQuestion(config, qi, qi - 1))}>
                ↑
              </button>
              <button
                disabled={qi === config.questions.length - 1}
                onClick={() => onChange(moveQuestion(config, qi, qi + 1))}
              >
                ↓
              </button>
              <button className="danger" onClick={() => onChange(removeQuestion(config, qi))}>
                Löschen
              </button>
            </div>
          </div>

          <label className="field">
            <span>Frage</span>
            <input
              value={q.question}
              onChange={(e) => onChange(updateQuestion(config, qi, { question: e.target.value }))}
            />
          </label>

          <label className="field">
            <span>Hinweis (optional)</span>
            <input
              value={q.hint ?? ''}
              onChange={(e) => onChange(updateQuestion(config, qi, { hint: e.target.value }))}
            />
          </label>

          <div className="options">
            {q.options.map((o, oi) => (
              <div className="option-row" key={o.id}>
                <div className="option-main">
                  <input
                    className="option-text"
                    placeholder="Antworttext"
                    value={o.text ?? ''}
                    onChange={(e) => onChange(updateOption(config, qi, oi, { text: e.target.value }))}
                  />
                  <button
                    className="danger"
                    disabled={q.options.length <= 2}
                    onClick={() => onChange(removeOption(config, qi, oi))}
                  >
                    ✕
                  </button>
                </div>
                <div className="points-row">
                  {outcomes.map(([key, outcome]) => (
                    <label className="points-cell" key={key}>
                      <span>{outcome.emoji} {outcome.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={o.points?.[key] ?? 0}
                        onChange={(e) =>
                          onChange(
                            setOptionPoints(config, qi, oi, key, Number(e.target.value) || 0),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
                <ImageUpload
                  uid={uid}
                  projectId={projectId}
                  value={o.image}
                  label="Bild (optional)"
                  onChange={(url) => onChange(updateOption(config, qi, oi, { image: url }))}
                />
                {o.image && (
                  <label className="field">
                    <span>Bildbeschreibung (Alt-Text)</span>
                    <input
                      value={o.alt ?? ''}
                      onChange={(e) => onChange(updateOption(config, qi, oi, { alt: e.target.value }))}
                    />
                  </label>
                )}
              </div>
            ))}
            <button className="link-btn" onClick={() => onChange(addOption(config, qi))}>
              + Antwort hinzufügen
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-primary" onClick={() => onChange(addQuestion(config))}>
        + Frage hinzufügen
      </button>

      <Tiebreaker config={config} onChange={onChange} />
    </div>
  );
}

function Tiebreaker({
  config,
  onChange,
}: {
  config: QuizConfig;
  onChange: (next: QuizConfig) => void;
}) {
  const tb = config.tiebreaker;
  const outcomes = Object.entries(config.destinations);

  return (
    <div className="card-block tiebreaker">
      <label className="field checkbox">
        <input
          type="checkbox"
          checked={!!tb}
          onChange={(e) => onChange(setTiebreakerEnabled(config, e.target.checked))}
        />
        <span>Stichfrage bei Gleichstand</span>
      </label>

      {tb && (
        <>
          <label className="field">
            <span>Stichfrage</span>
            <input
              value={tb.question}
              onChange={(e) => onChange(updateTiebreakerQuestion(config, e.target.value))}
            />
          </label>
          {tb.options.map((o, oi) => (
            <div className="option-row" key={o.id}>
              <div className="option-main">
                <input
                  className="option-text"
                  placeholder="Antworttext"
                  value={o.text ?? ''}
                  onChange={(e) => onChange(updateTiebreakerOption(config, oi, { text: e.target.value }))}
                />
                <select
                  value={o.winner ?? ''}
                  onChange={(e) => onChange(updateTiebreakerOption(config, oi, { winner: e.target.value }))}
                >
                  <option value="">— Gewinner —</option>
                  {outcomes.map(([key, outcome]) => (
                    <option value={key} key={key}>
                      {outcome.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <small className="muted">
            Die Stichfrage nutzt zwei Antworten, je eine pro Gewinner-Ergebnis.
          </small>
        </>
      )}
    </div>
  );
}
