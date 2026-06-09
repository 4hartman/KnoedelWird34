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
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Project, QuizConfig, ThemeConfig } from '../types';
import { templateByKey } from '../lib/templates';

const COL = 'projects';

export async function listProjects(ownerUid: string): Promise<Project[]> {
  const q = query(collection(db, COL), where('ownerUid', '==', ownerUid));
  const snap = await getDocs(q);
  const projects = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Project, 'id'>),
  }));
  return projects.sort((a, b) => millis(b.updatedAt) - millis(a.updatedAt));
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
    title,
    published: false,
    theme: tpl.theme,
    config: tpl.config,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
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
    title: `${source.title} (Kopie)`,
    published: false,
    theme: source.theme,
    config: source.config,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
