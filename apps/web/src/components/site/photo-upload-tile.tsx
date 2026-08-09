'use client';

import { useRef, useState } from 'react';
import { uploadFile } from '@/components/site/lib/upload-photo';

export function PhotoUploadTile({
  label,
  value,
  onChange,
  stage,
  reservationId,
  rentalBookingId,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  stage: 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN';
  reservationId?: string;
  rentalBookingId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file, stage, { reservationId, rentalBookingId });
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed border-light-gray text-center dark:border-[#2A2A2A]"
      >
        {value ? (
          // Uses a plain <img> since photos can point at arbitrary Supabase storage URLs at any size.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full rounded-card object-cover" />
        ) : (
          <>
            <span className="text-2xl text-medium-gray">+</span>
            <span className="px-4 text-xs text-medium-gray">{uploading ? 'Uploading…' : 'Tap to upload photo'}</span>
          </>
        )}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
