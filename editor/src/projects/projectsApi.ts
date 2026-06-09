// Firestore access layer for projects. Projects live in a top-level `projects`
// collection (not nested under users) so the published runtime can read a gift
// by slug without knowing the owner's uid, while security rules stay simple:
// owner-only writes, public read once `published` is true.

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Project, QuizConfig, ThemeConfig } from '../types';
import { templateByKey } from '../lib/templates';

const COL = 'projects';

// Returns the user's own projects plus any shared with their email, deduped.
export async function listProjects(
  ownerUid: string,
  email?: string | null,
): Promise<Project[]> {
  const queries = [getDocs(query(collection(db, COL), where('ownerUid', '==', ownerUid)))];
  if (email) {
    queries.push(
      getDocs(query(collection(db, COL), where('editorEmails', 'array-contains', email.toLowerCase()))),
    );
  }
  const snaps = await Promise.all(queries);
  const byId = new Map<string, Project>();
  snaps.forEach((snap) =>
    snap.docs.forEach((d) => byId.set(d.id, { id: d.id, ...(d.data() as Omit<Project, 'id'>) })),
  );
  return [...byId.values()].sort((a, b) => millis(b.updatedAt) - millis(a.updatedAt));
}

function millis(ts: unknown): number {
  if (ts && typeof (ts as Timestamp).toMillis === 'function') {
    return (ts as Timestamp).toMillis();
  }
  return 0;
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Project, 'id'>) };
}

export async function createProject(
  ownerUid: string,
  title: string,
  templateKey: string,
): Promise<string> {
  const tpl = templateByKey(templateKey);
  const ref = await addDoc(collection(db, COL), {
    ownerUid,
    editorEmails: [],
    title,
    published: false,
    theme: tpl.theme,
    config: tpl.config,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Collaborator management (owner only — enforced by security rules). Emails are
// stored lowercased to match Firebase Auth's token email.
export async function addCollaborator(id: string, email: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    editorEmails: arrayUnion(email.trim().toLowerCase()),
    updatedAt: serverTimestamp(),
  });
}

export async function removeCollaborator(id: string, email: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    editorEmails: arrayRemove(email),
    updatedAt: serverTimestamp(),
  });
}

export async function saveProjectConfig(
  id: string,
  config: QuizConfig,
  theme: ThemeConfig,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    config,
    theme,
    updatedAt: serverTimestamp(),
  });
}

export async function renameProject(id: string, title: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { title, updatedAt: serverTimestamp() });
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function duplicateProject(source: Project): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ownerUid: source.ownerUid,
    editorEmails: [],
    title: `${source.title} (Kopie)`,
    published: false,
    theme: source.theme,
    config: source.config,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
