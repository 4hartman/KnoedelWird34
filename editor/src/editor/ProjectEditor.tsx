// Project editor shell: loads the project, holds the editable draft, renders the
// tabbed editing UI, and surfaces save status. Tabs: General, Outcomes,
// Questions (Phase 2), Theme (Phase 3), Publish (Phase 5).

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import { getProject } from '../projects/projectsApi';
import { useProjectDraft, type SaveStatus } from './useProjectDraft';
import { GeneralTab } from './tabs/GeneralTab';
import { OutcomesTab } from './tabs/OutcomesTab';
import { QuestionsTab } from './tabs/QuestionsTab';
import { ThemeTab } from './tabs/ThemeTab';
import { PublishTab } from './tabs/PublishTab';
import { PreviewPane } from './PreviewPane';
import { useAuth } from '../auth/AuthContext';

type TabKey = 'general' | 'outcomes' | 'questions' | 'theme' | 'preview' | 'publish';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'general', label: 'Allgemein' },
  { key: 'outcomes', label: 'Ergebnisse' },
  { key: 'questions', label: 'Fragen' },
  { key: 'theme', label: 'Design' },
  { key: 'preview', label: 'Vorschau' },
  { key: 'publish', label: 'Veröffentlichen' },
];

export function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then((p) => {
        if (!p) setError('Projekt nicht gefunden.');
        else setProject(p);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Laden fehlgeschlagen.'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="centered muted">Lädt…</div>;
  if (error) return <div className="centered error">{error}</div>;
  if (!project || !id) return null;

  return (
    <EditorBody key={project.id} projectId={id} project={project} onBack={() => navigate('/')} />
  );
}

function EditorBody({
  projectId,
  project,
  onBack,
}: {
  projectId: string;
  project: Project;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('general');
  const { config, setConfig, theme, setTheme, status, save } = useProjectDraft(
    projectId,
    project.config,
    project.theme,
  );
  const uid = user?.uid ?? '';

  return (
    <div className="page editor-page">
      <header className="app-header">
        <button className="link-btn" onClick={onBack}>← Zurück</button>
        <h1>{project.title}</h1>
        <SaveBadge status={status} />
        <button className="btn-inline" onClick={() => void save()}>Speichern</button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="editor-main">
        {tab === 'general' && <GeneralTab config={config} onChange={setConfig} />}
        {tab === 'outcomes' && <OutcomesTab config={config} onChange={setConfig} />}
        {tab === 'questions' && (
          <QuestionsTab
            config={config}
            onChange={setConfig}
            uid={uid}
            projectId={projectId}
          />
        )}
        {tab === 'theme' && (
          <ThemeTab uid={uid} projectId={projectId} theme={theme} onChange={setTheme} />
        )}
        {tab === 'preview' && <PreviewPane config={config} theme={theme} />}
        {tab === 'publish' && (
          <PublishTab
            projectId={projectId}
            title={project.title}
            config={config}
            initialSlug={project.slug}
            initialPublished={project.published}
            onSaveFirst={save}
          />
        )}
      </main>
    </div>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, string> = {
    idle: '',
    dirty: 'Nicht gespeichert…',
    saving: 'Speichert…',
    saved: 'Gespeichert ✓',
    error: 'Fehler beim Speichern',
  };
  if (!map[status]) return null;
  return <span className={`save-badge ${status}`}>{map[status]}</span>;
}
