// Reusable image picker: drag-and-drop or click to upload an image to Storage.
// Shows a thumbnail of the current image and a remove button. Used for answer
// option images and the theme background.

import { useRef, useState } from 'react';
import { uploadImage } from '../lib/uploadImage';

interface Props {
  uid: string;
  projectId: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
}

export function ImageUpload({ uid, projectId, value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await uploadImage(uid, projectId, file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-upload">
      {label && <span className="field-label">{label}</span>}
      {value ? (
        <div className="image-preview">
          <img src={value} alt="" />
          <button className="danger" onClick={() => onChange(undefined)}>
            Bild entfernen
          </button>
        </div>
      ) : (
        <div
          className={`dropzone ${busy ? 'busy' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFile(e.dataTransfer.files[0]);
          }}
        >
          {busy ? 'Lädt hoch…' : 'Bild hierher ziehen oder klicken'}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
