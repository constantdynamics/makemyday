/**
 * Uploads an adventure verification photo to the public `mmd-photos` bucket and
 * returns its public URL. Images are downscaled client-side so uploads stay
 * small and fast on mobile data. Files live under `{userId}/…` which the
 * storage RLS policy ties to the signed-in user.
 */
import { supabase } from './supabase';

const BUCKET = 'mmd-photos';
const MAX_EDGE = 1280;
const QUALITY = 0.82;

async function downscale(file: File): Promise<Blob> {
  // Bail out gracefully if the browser can't decode (e.g. HEIC) — upload as-is.
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function uploadAdventurePhoto(userId: string, file: File): Promise<string> {
  const blob = await downscale(file);
  const isJpeg = blob.type === 'image/jpeg' || blob === file;
  const ext =
    blob.type === 'image/png'
      ? 'png'
      : blob.type === 'image/webp'
        ? 'webp'
        : isJpeg
          ? 'jpg'
          : 'jpg';
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${userId}/${id}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: blob.type || 'image/jpeg',
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
