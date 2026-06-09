// Modal for creating a project: name it and pick a starter template so the
// editor begins with real content instead of an empty quiz.

import { useState } from 'react';
import { TEMPLATES } from '../lib/templates';

interface Props {
  onCancel: () => void;
  onCreate: (title: string, templateKey: string) => void;
}

export function NewProjectModal({ onCancel, onCreate }: Props) {
  const [title, setTitle] = useState('Mein Geschenk');
  const [templateKey, setTemplateKey] = useState(TEMPLATES[0].key);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Neues Geschenk</h2>

        <label className="field">
          <span>Name</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>

        <span className="field-label">Vorlage wählen</span>
        <div className="template-list">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              className={`template-option ${templateKey === t.key ? 'active' : ''}`}
              onClick={() => setTemplateKey(t.key)}
            >
              <strong>{t.name}</strong>
              <small>{t.description}</small>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="link-btn" onClick={onCancel}>
            Abbrechen
          </button>
          <button
            className="btn-inline"
            disabled={!title.trim()}
            onClick={() => onCreate(title.trim(), templateKey)}
          >
            Erstellen
          </button>
        </div>
      </div>
    </div>
  );
}
