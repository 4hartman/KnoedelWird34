// Publish tab: validates the gift, lets the user pick a public link (slug),
// publishes it, and shows the live URL plus a downloadable QR code. Before
// publishing it flushes any pending edits so the runtime (which reads the live
// project doc) serves the latest content.

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { QuizConfig } from '../../types';
import { validateConfig } from '../../lib/validateConfig';
import {
  publishProject,
  unpublishProject,
  slugify,
  publicUrl,
} from '../../projects/publishApi';

interface Props {
  projectId: string;
  title: string;
  config: QuizConfig;
  initialSlug?: string;
  initialPublished: boolean;
  onSaveFirst: () => Promise<void>;
}

export function PublishTab({
  projectId,
  title,
  config,
  initialSlug,
  initialPublished,
  onSaveFirst,
}: Props) {
  const [slug, setSlug] = useState(initialSlug || slugify(title));
  const [published, setPublished] = useState(initialPublished);
  const [livedSlug, setLivedSlug] = useState(initialSlug);
  const [qr, setQr] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const problems = validateConfig(config);
  const url = livedSlug ? publicUrl(livedSlug) : '';

  useEffect(() => {
    if (published && url) {
      QRCode.toDataURL(url, { width: 320, margin: 2 }).then(setQr).catch(() => setQr(''));
    } else {
      setQr('');
    }
  }, [published, url]);

  async function handlePublish() {
    setError('');
    const cleanSlug = slugify(slug);
    if (!cleanSlug) {
      setError('Bitte einen gültigen Link-Namen eingeben.');
      return;
    }
    setBusy(true);
    try {
      await onSaveFirst();
      await publishProject(projectId, cleanSlug, livedSlug);
      setSlug(cleanSlug);
      setLivedSlug(cleanSlug);
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veröffentlichen fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    setBusy(true);
    try {
      await unpublishProject(projectId);
      setPublished(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tab-panel">
      <h2>Veröffentlichen</h2>

      {problems.length > 0 ? (
        <div className="validation">
          <p className="error">Vor dem Veröffentlichen bitte beheben:</p>
          <ul>
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">Dein Geschenk ist bereit zum Veröffentlichen. 🎉</p>
      )}

      <label className="field">
        <span>Öffentlicher Link</span>
        <div className="slug-row">
          <span className="slug-prefix">…/g/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="mein-geschenk"
          />
        </div>
        <small className="muted">{publicUrl(slugify(slug) || 'mein-geschenk')}</small>
      </label>

      {error && <p className="error">{error}</p>}

      <div className="publish-actions">
        <button
          className="btn-inline"
          disabled={busy || problems.length > 0}
          onClick={() => void handlePublish()}
        >
          {published ? 'Erneut veröffentlichen' : 'Veröffentlichen'}
        </button>
        {published && (
          <button className="link-btn" disabled={busy} onClick={() => void handleUnpublish()}>
            Zurückziehen
          </button>
        )}
      </div>

      {published && url && (
        <div className="published-box">
          <span className="badge live">Live</span>
          <a href={url} target="_blank" rel="noreferrer">{url}</a>
          <div className="qr-actions">
            <button className="link-btn" onClick={() => void navigator.clipboard.writeText(url)}>
              Link kopieren
            </button>
          </div>
          {qr && (
            <div className="qr">
              <img src={qr} alt="QR-Code" />
              <a className="link-btn" href={qr} download={`${livedSlug}-qr.png`}>
                QR-Code herunterladen
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
