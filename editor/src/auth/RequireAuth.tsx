// Route guard: shows a loading state while auth resolves, the login screen when
// signed out, and the protected content once an editor is authenticated.

import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Login } from './Login';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered muted">Lädt…</div>;
  if (!user) return <Login />;
  return <>{children}</>;
}
