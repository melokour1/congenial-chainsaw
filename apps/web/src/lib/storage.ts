import { createAdminClient } from './supabase/admin';

/**
 * Uploads a base64 data URL (from a <input type="file"> or camera capture) to Supabase
 * Storage and returns its public/URL. `bucket` is "photos" (public — pickup/return/add-on
 * shots) or "documents" (private — DL scans, insurance cards, signed agreements).
 */
export async function uploadDataUrl(
  bucket: 'photos' | 'documents',
  path: string,
  dataUrl: string,
): Promise<string> {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('expected a base64 data URL');
  const [, contentType, base64] = match;
  const bytes = Buffer.from(base64, 'base64');

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: true });
  if (error) throw error;

  if (bucket === 'photos') {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  const { data, error: signError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signError) throw signError;
  return data.signedUrl;
}
