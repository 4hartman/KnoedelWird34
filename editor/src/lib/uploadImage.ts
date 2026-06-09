// Uploads an image to Firebase Storage under userImages/{uid}/{projectId}/ and
// returns its public download URL for embedding in a quiz config. Images are
// downscaled and re-encoded client-side first to keep uploads small and within
// the Storage rule's size limit.

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { makeId } from './templates';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export async function uploadImage(
  uid: string,
  projectId: string,
  file: File,
): Promise<string> {
  const blob = await downscale(file);
  const path = `userImages/${uid}/${projectId}/${makeId('img')}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas wird nicht unterstützt.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Bild konnte nicht verarbeitet werden.'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}
