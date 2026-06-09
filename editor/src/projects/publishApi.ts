// Publishing: claims a unique public slug and flips the project to published so
// the runtime can serve it at /g/{slug}. The slug claim runs in a transaction
// against the public `slugs` collection to prevent two projects taking the same
// slug. Re-publishing to the same slug is allowed; switching slugs releases the
// previous one.

import { doc, runTransaction, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Public origin that serves the runtime. Update once a custom domain is added.
export const PUBLIC_ORIGIN = 'https://brave-reason-367609.web.app';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function publicUrl(slug: string): string {
  return `${PUBLIC_ORIGIN}/g/${slug}`;
}

// Claims `slug` for the project and publishes it. Throws if the slug is taken by
// a different project.
export async function publishProject(
  projectId: string,
  slug: string,
  previousSlug?: string,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const slugRef = doc(db, 'slugs', slug);
    const slugSnap = await tx.get(slugRef);
    if (slugSnap.exists() && slugSnap.data().projectId !== projectId) {
      throw new Error('Dieser Link ist bereits vergeben. Bitte einen anderen wählen.');
    }
    const projectRef = doc(db, 'projects', projectId);
    tx.set(slugRef, { projectId });
    if (previousSlug && previousSlug !== slug) {
      tx.delete(doc(db, 'slugs', previousSlug));
    }
    tx.update(projectRef, { slug, published: true, updatedAt: serverTimestamp() });
  });
}

export async function unpublishProject(projectId: string): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId), {
    published: false,
    updatedAt: serverTimestamp(),
  });
}
