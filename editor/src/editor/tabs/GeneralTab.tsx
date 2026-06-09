// General tab: edits who the gift is for and the intro screen copy. The
// {recipient} placeholder in the greeting is interpolated by the runtime.

import type { QuizConfig } from '../../types';
import { updateMeta, updateIntro } from '../configOps';

interface Props {
  config: QuizConfig;
  onChange: (next: QuizConfig) => void;
}

export function GeneralTab({ config, onChange }: Props) {
  return (
    <div className="tab-panel">
      <h2>Allgemein</h2>

      <label className="field">
        <span>Beschenkte Person</span>
        <input
          value={config.meta.recipient}
          onChange={(e) => onChange(updateMeta(config, { recipient: e.target.value }))}
        />
        <small className="muted">
          Wird über <code>{'{recipient}'}</code> in den Text eingesetzt.
        </small>
      </label>

      <label className="field">
        <span>Anlass</span>
        <input
          value={config.meta.occasion}
          onChange={(e) => onChange(updateMeta(config, { occasion: e.target.value }))}
        />
      </label>

      <label className="field checkbox">
        <input
          type="checkbox"
          checked={config.meta.voteBarEnabled}
          onChange={(e) =>
            onChange(updateMeta(config, { voteBarEnabled: e.target.checked }))
          }
        />
        <span>Live-Abstimmung für Zuschauer aktivieren</span>
      </label>

      <h3>Startbildschirm</h3>

      <label className="field">
        <span>Begrüßung</span>
        <input
          value={config.intro.greeting}
          onChange={(e) => onChange(updateIntro(config, { greeting: e.target.value }))}
        />
      </label>

      <label className="field">
        <span>Untertitel</span>
        <input
          value={config.intro.subtitle}
          onChange={(e) => onChange(updateIntro(config, { subtitle: e.target.value }))}
        />
      </label>

      <label className="field">
        <span>Button-Text</span>
        <input
          value={config.intro.buttonText}
          onChange={(e) =>
            onChange(updateIntro(config, { buttonText: e.target.value }))
          }
        />
      </label>
    </div>
  );
}
