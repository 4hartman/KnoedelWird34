// Manage project collaborators. The owner can invite people by email (granting
// them full admin/edit access) and remove them; collaborators see the list
// read-only. Access is enforced by Firestore rules via the editorEmails list.

import { useState } from 'react';
import { addCollaborator, removeCollaborator } from '../projects/projectsApi';

interface Props {
  projectId: string;
  ownerUid: string;
  initialEmails: string[];
  isOwner: boolean;
  onClose: () => void;
}

export function CollaboratorsModal({
  projectId,
  initialEmails,
  isOwner,
  onClose,
}: Props) {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function invite() {
    const email = input.trim().toLowerCase();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte eine gültige E-Mail eingeben.');
      return;
    }
    if (emails.includes(email)) {
      setError('Diese Person ist bereits eingeladen.');
      return;
    }
    setBusy(true);
    try {
      await addCollaborator(projectId, email);
      setEmails([...emails, email]);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Einladen fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(email: string) {
    setBusy(true);
    try {
      await removeCollaborator(projectId, email);
      setEmails(emails.filter((e) => e !== email));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Entfernen fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Teilen</h2>
        <p className="muted">
          Eingeladene Personen können dieses Geschenk vollständig bearbeiten.
        </p>

        {isOwner && (
          <div className="invite-row">
            <input
              type="email"
              placeholder="email@beispiel.de"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void invite()}
            />
            <button className="btn-inline" disabled={busy} onClick={() => void invite()}>
              Einladen
            </button>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <ul className="collab-list">
          {emails.length === 0 && (
            <li className="muted">Noch keine Mitbearbeiter*innen.</li>
          )}
          {emails.map((email) => (
            <li key={email}>
              <span>{email}</span>
              {isOwner && (
                <button className="link-btn danger" disabled={busy} onClick={() => void remove(email)}>
                  Entfernen
                </button>
              )}
            </li>
          ))}
        </ul>

        {!isOwner && (
          <p className="muted">Nur der*die Eigentümer*in kann Personen verwalten.</p>
        )}

        <div className="modal-actions">
          <button className="btn-inline" onClick={onClose}>Fertig</button>
        </div>
      </div>
    </div>
  );
}
