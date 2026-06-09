// Holds the in-memory draft of a project's config + theme while editing, and
// handles persistence: debounced autosave plus an explicit save(). Tracks a
// dirty flag and a saving state so the editor UI can show save status. The
// draft is the single source of truth the editor mutates; Firestore is written
// from it.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuizConfig, ThemeConfig } from '../types';
import { saveProjectConfig } from '../projects/projectsApi';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const AUTOSAVE_MS = 1500;

export function useProjectDraft(
  projectId: string,
  initialConfig: QuizConfig,
  initialTheme: ThemeConfig,
) {
  const [config, setConfig] = useState<QuizConfig>(initialConfig);
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState('');

  const latest = useRef({ config, theme });
  latest.current = { config, theme };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setStatus('saving');
    try {
      await saveProjectConfig(projectId, latest.current.config, latest.current.theme);
      setError('');
      setStatus('saved');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      console.error('[save] failed:', e);
      setStatus('error');
    }
  }, [projectId]);

  // Debounced autosave whenever the draft changes after the first render.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setStatus('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persist();
    }, AUTOSAVE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [config, theme, persist]);

  return { config, setConfig, theme, setTheme, status, error, save: persist };
}
