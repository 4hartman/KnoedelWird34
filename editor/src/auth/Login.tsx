// Public landing page shown to signed-out visitors: explains what Unwrap is,
// how it works, and its key features, with the sign-in / register card built in.
// On successful auth the AuthProvider listener routes into the app.

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Logo } from '../brand/Logo';

const STEPS = [
  {
    n: '1',
    title: 'Quiz & Ergebnisse erstellen',
    body: 'Schreibe persönliche Fragen, lege mögliche Ergebnisse fest (z. B. Reiseziele) und verteile Punkte. Die Antworten steuern, was am Ende herauskommt.',
  },
  {
    n: '2',
    title: 'Gestalten',
    body: 'Passe Farben, Hintergrund, Bilder und Schriften an – mit Live-Vorschau direkt daneben. Oder starte mit einer Vorlage.',
  },
  {
    n: '3',
    title: 'Teilen',
    body: 'Veröffentliche dein Geschenk und verschicke es per Link oder QR-Code. Beschenkte brauchen kein Konto.',
  },
];

const FEATURES = [
  { icon: '🎯', title: 'Persönliche Reise', body: 'Die Antworten der Beschenkten führen Schritt für Schritt zur Enthüllung.' },
  { icon: '📊', title: 'Live-Abstimmung', body: 'Gäste stimmen in Echtzeit mit und fiebern gemeinsam dem Ergebnis entgegen.' },
  { icon: '🎨', title: 'Eigenes Design', body: 'Farben, Transparenz, Hintergrundbilder und Schriften – ganz nach deinem Stil.' },
  { icon: '🔗', title: 'Link & QR-Code', body: 'Jedes Geschenk bekommt eine eigene Adresse und einen QR-Code zum Teilen.' },
  { icon: '👥', title: 'Gemeinsam gestalten', body: 'Lade Mitgestalter*innen per E-Mail ein und arbeitet zusammen am Geschenk.' },
  { icon: '✨', title: 'Vorlagen', body: 'Starte nie bei null – wähle eine Vorlage und passe sie an.' },
];

export function Login() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo size={34} />
        <a className="link-btn" href="#auth">Anmelden</a>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <h1 className="hero-title">Verschenke eine Überraschung zum Spielen.</h1>
          <p className="hero-sub">
            Mit <strong>Unwrap</strong> baust du ein persönliches Quiz, an dessen Ende
            sich dein Geschenk enthüllt – gemeinsam erlebt, live mitgefiebert.
          </p>
          <a className="btn btn-primary hero-cta" href="#auth">Kostenlos starten</a>
        </div>
        <AuthCard />
      </header>

      <section className="section">
        <h2 className="section-title">So funktioniert's</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Was Unwrap kann</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section closing">
        <h2 className="section-title">Bereit, etwas Besonderes zu verschenken?</h2>
        <a className="btn btn-primary hero-cta" href="#auth">Jetzt loslegen</a>
      </section>

      <footer className="landing-footer">
        <Logo size={26} />
        <span className="muted">Ein Geschenk, das man durch Spielen öffnet.</span>
      </footer>
    </div>
  );
}

function AuthCard() {
  const { signInGoogle, signInEmail, registerEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card" id="auth">
      <h2 className="auth-heading">{mode === 'signin' ? 'Willkommen zurück' : 'Konto erstellen'}</h2>
      <p className="muted">Melde dich an, um deine Überraschungen zu gestalten.</p>

      <button className="btn btn-google" disabled={busy} onClick={() => run(signInGoogle)}>
        Mit Google anmelden
      </button>

      <div className="divider"><span>oder</span></div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() =>
            mode === 'signin' ? signInEmail(email, password) : registerEmail(email, password),
          );
        }}
      >
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary" disabled={busy} type="submit">
          {mode === 'signin' ? 'Anmelden' : 'Konto erstellen'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <button
        className="link-btn"
        onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
      >
        {mode === 'signin' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
      </button>
    </div>
  );
}
