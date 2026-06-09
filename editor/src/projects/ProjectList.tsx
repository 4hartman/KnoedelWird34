// Project overview: the landing screen after login. Lists the signed-in user's
// projects, with a + button to create a new one (seeded from the default
// template) and per-card actions to open, rename, duplicate, or delete.

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Project } from '../types';
import {
  listProjects,
  createProject,
  renameProject,
  deleteProject,
  duplicateProject,
} from './projectsApi';
import { NewProjectModal } from './NewProjectModal';
import { Logo } from '../brand/Logo';

export function ProjectList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setProjects(await listProjects(user.uid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(title: string, templateKey: string) {
    if (!user) return;
    const id = await createProject(user.uid, title, templateKey);
    navigate(`/project/${id}`);
  }

  async function handleRename(p: Project) {
    const title = window.prompt('Neuer Name?', p.title);
    if (!title || title === p.title) return;
    await renameProject(p.id, title);
    refresh();
  }

  async function handleDelete(p: Project) {
    if (!window.confirm(`„${p.title}" wirklich löschen?`)) return;
    await deleteProject(p.id);
    refresh();
  }

  async function handleDuplicate(p: Project) {
    await duplicateProject(p);
    refresh();
  }

  return (
    <div className="page">
      <header className="app-header">
        <Logo size={36} />
        <div className="header-actions">
          <span className="muted">{user?.email ?? user?.displayName}</span>
          <button className="link-btn" onClick={() => logout()}>
            Abmelden
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Lädt…</p>
      ) : (
        <div className="project-grid">
          <button className="project-card new-card" onClick={() => setCreating(true)}>
            <span className="plus">+</span>
            <span>Neues Geschenk</span>
          </button>

          {projects.map((p) => (
            <div className="project-card" key={p.id}>
              <button
                className="card-open"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <span className="card-title">{p.title}</span>
                <span className={`badge ${p.published ? 'live' : 'draft'}`}>
                  {p.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </button>
              <div className="card-actions">
                <button onClick={() => handleRename(p)}>Umbenennen</button>
                <button onClick={() => handleDuplicate(p)}>Duplizieren</button>
                <button className="danger" onClick={() => handleDelete(p)}>
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <NewProjectModal
          onCancel={() => setCreating(false)}
          onCreate={(title, templateKey) => {
            setCreating(false);
            void handleCreate(title, templateKey);
          }}
        />
      )}
    </div>
  );
}
