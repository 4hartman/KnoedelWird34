// Theme tab: visual customization. Palette colors map to CSS variables the
// runtime applies inline; background is either a gradient preset/custom value or
// an uploaded image; font picks from a small curated list. Changes feed the same
// draft/autosave pipeline as the rest of the editor.

import type { ThemeConfig } from '../../types';
import { ImageUpload } from '../ImageUpload';
import { DEFAULT_THEME } from '../../lib/templates';

interface Props {
  uid: string;
  projectId: string;
  theme: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
}

const BACKGROUND_PRESETS: { name: string; css: string }[] = [
  {
    name: 'Sonnenuntergang',
    css: 'linear-gradient(135deg, #f6d186 0%, #f6b06a 35%, #d97448 65%, #5f7a8a 100%)',
  },
  { name: 'Meer', css: 'linear-gradient(135deg, #0a4d8c 0%, #2e8bc0 45%, #e8c074 100%)' },
  { name: 'Nordsee', css: 'linear-gradient(135deg, #c8102e 0%, #f4e9d8 50%, #003c71 100%)' },
  { name: 'Wald', css: 'linear-gradient(135deg, #2d5016 0%, #6a9b41 50%, #d9e8b8 100%)' },
  { name: 'Beere', css: 'linear-gradient(135deg, #6a1b4d 0%, #b3306f 50%, #f2a9c4 100%)' },
  { name: 'Nacht', css: 'linear-gradient(135deg, #0f1b3c 0%, #3a3f7a 50%, #8b6fb0 100%)' },
];

const FONTS = ['Quicksand', 'Nunito', 'Playfair Display', 'Fraunces', 'Georgia', 'system-ui'];

const PALETTE_FIELDS: { key: keyof ThemeConfig['palette']; label: string }[] = [
  { key: 'primary', label: 'Primärfarbe' },
  { key: 'accent', label: 'Akzentfarbe' },
  { key: 'text', label: 'Textfarbe' },
  { key: 'card', label: 'Kartenfarbe' },
];

export function ThemeTab({ uid, projectId, theme, onChange }: Props) {
  function setPalette(key: keyof ThemeConfig['palette'], value: string) {
    onChange({ ...theme, palette: { ...theme.palette, [key]: value } });
  }

  function resetToDefault() {
    if (!window.confirm('Design auf Standard zurücksetzen?')) return;
    onChange({ ...DEFAULT_THEME, palette: { ...DEFAULT_THEME.palette } });
  }

  const cardOpacity = theme.cardOpacity ?? 0.86;

  return (
    <div className="tab-panel">
      <div className="panel-head">
        <h2>Design</h2>
        <button className="link-btn" onClick={resetToDefault}>
          Auf Standard zurücksetzen
        </button>
      </div>

      <h3>Farben</h3>
      <div className="palette-grid">
        {PALETTE_FIELDS.map(({ key, label }) => (
          <label className="color-field" key={key}>
            <span>{label}</span>
            <input
              type="color"
              value={theme.palette[key]}
              onChange={(e) => setPalette(key, e.target.value)}
            />
          </label>
        ))}
      </div>

      <label className="field">
        <span>Karten-Transparenz: {Math.round(cardOpacity * 100)}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(cardOpacity * 100)}
          onChange={(e) => onChange({ ...theme, cardOpacity: Number(e.target.value) / 100 })}
        />
      </label>

      <h3>Hintergrund</h3>
      <div className="preset-grid">
        {BACKGROUND_PRESETS.map((p) => (
          <button
            key={p.name}
            className={`preset ${theme.backgroundCss === p.css && !theme.backgroundImage ? 'active' : ''}`}
            style={{ background: p.css }}
            title={p.name}
            onClick={() => onChange({ ...theme, backgroundCss: p.css, backgroundImage: undefined })}
          >
            {p.name}
          </button>
        ))}
      </div>

      <ImageUpload
        uid={uid}
        projectId={projectId}
        value={theme.backgroundImage}
        label="Eigenes Hintergrundbild"
        onChange={(url) => onChange({ ...theme, backgroundImage: url })}
      />

      <h3>Schriften</h3>
      <div className="grid-2">
        <label className="field">
          <span>Überschriften</span>
          <select
            value={theme.headingFont ?? 'Playfair Display'}
            onChange={(e) => onChange({ ...theme, headingFont: e.target.value })}
            style={{ fontFamily: `'${theme.headingFont ?? 'Playfair Display'}', serif` }}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: `'${f}'` }}>{f}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Fließtext</span>
          <select
            value={theme.font}
            onChange={(e) => onChange({ ...theme, font: e.target.value })}
            style={{ fontFamily: `'${theme.font}', sans-serif` }}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: `'${f}'` }}>{f}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
