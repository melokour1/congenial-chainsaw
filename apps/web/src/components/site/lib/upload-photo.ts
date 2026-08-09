/** Reads a File as a base64 data: URL and uploads it via POST /api/photos. Returns the public URL. */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function uploadPhoto(params: {
  dataUrl: string;
  stage: 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN';
  reservationId?: string;
  rentalBookingId?: string;
}): Promise<{ id: string; url: string }> {
  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error ?? 'Upload failed');
  }
  return res.json();
}

export async function uploadFile(
  file: File,
  stage: 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN',
  ids: { reservationId?: string; rentalBookingId?: string } = {},
): Promise<{ id: string; url: string }> {
  const dataUrl = await fileToDataUrl(file);
  return uploadPhoto({ dataUrl, stage, ...ids });
}
