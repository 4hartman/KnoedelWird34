// Live preview: renders the in-memory draft (config + theme) as a phone mockup
// so the user sees their gift update instantly while editing. This is an
// approximation of the published runtime — it mirrors the runtime's look
// (background, palette, fonts, intro/question/reveal cards) but is intentionally
// non-interactive; the real gift is the published runtime.

import type { QuizConfig, ThemeConfig } from '../types';

interface Props {
  config: QuizConfig;
  theme: ThemeConfig;
}

export function PreviewPane({ config, theme }: Props) {
  const bg = theme.backgroundImage
    ? `url('${theme.backgroundImage}')`
    : theme.backgroundCss;

  const style = {
    '--p-bg': bg,
    '--p-primary': theme.palette.primary,
    '--p-accent': theme.palette.accent,
    '--p-font': `'${theme.font}', sans-serif`,
    '--p-heading-font': `'${theme.headingFont ?? 'Playfair Display'}', serif`,
  } as React.CSSProperties;

  const greeting = config.intro.greeting.replace(
    /\{recipient\}/g,
    config.meta.recipient,
  );
  const outcomes = Object.values(config.destinations);

  return (
    <div className="tab-panel">
      <h2>Vorschau</h2>
      <p className="muted">
        Annäherung an das veröffentlichte Geschenk. Aktualisiert sich live.
      </p>

      <div className="phone" style={style}>
        <div className="phone-screen">
          <div className="p-card p-intro">
            <div className="p-occasion">{config.meta.occasion}</div>
            <div className="p-greeting">{greeting}</div>
            <div className="p-subtitle">{config.intro.subtitle}</div>
            <div className="p-btn p-btn-primary">{config.intro.buttonText}</div>
          </div>

          {config.questions.map((q, i) => (
            <div className="p-card" key={q.id}>
              <div className="p-step">Frage {i + 1}</div>
              <div className="p-question">{q.question}</div>
              {q.hint && <div className="p-hint">{q.hint}</div>}
              <div className={`p-options ${q.options.every((o) => o.image) ? 'grid' : ''}`}>
                {q.options.map((o) => (
                  <div className="p-btn" key={o.id}>
                    {o.image && <img src={o.image} alt={o.alt ?? ''} />}
                    {o.text && <span>{o.text}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {outcomes.map((o, i) => (
            <div className="p-card p-reveal" key={i}>
              {o.emoji && <div className="p-emoji">{o.emoji}</div>}
              {o.title && <div className="p-reveal-title">{o.title}</div>}
              <div className="p-reveal-dest">{o.label}</div>
              {o.tagline && <div className="p-reveal-tagline">{o.tagline}</div>}
              {o.details && <div className="p-reveal-details">{o.details}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
