// Login screen for editors. Offers Google sign-in and an email/password form
// that toggles between sign-in and register. On success the auth listener in
// AuthProvider redirects into the app via the route guard.

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Logo } from '../brand/Logo';

export function Login() {
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
    <div className="auth-screen">
      <div className="auth-card">
        <Logo size={48} />
        <p className="tagline">Ein Geschenk, das man durch Spielen öffnet.</p>
        <p className="muted">Melde dich an, um deine Überraschungen zu gestalten.</p>

        <button
          className="btn btn-google"
          disabled={busy}
          onClick={() => run(signInGoogle)}
        >
          Mit Google anmelden
        </button>

        <div className="divider"><span>oder</span></div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() =>
              mode === 'signin'
                ? signInEmail(email, password)
                : registerEmail(email, password),
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
          {mode === 'signin'
            ? 'Noch kein Konto? Registrieren'
            : 'Schon ein Konto? Anmelden'}
        </button>
      </div>
    </div>
  );
}
