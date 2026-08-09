'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui';

interface PhotoCaptureSheetProps {
  title: string;
  minPhotos?: number;
  stage: 'PICKUP' | 'RETURN' | 'ADDON';
  reservationId: string;
  onDone: (photoUrls: string[]) => void;
  onCancel: () => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** File-input based camera capture (spec 4.5/4.6) — simplest reliable path on a phone browser. */
export function PhotoCaptureSheet({ title, minPhotos = 4, stage, reservationId, onDone, onCancel }: PhotoCaptureSheetProps) {
  const [photos, setPhotos] = useState<{ url: string; uploading: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFile = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    const placeholder = { url: dataUrl, uploading: true };
    setPhotos((p) => [...p, placeholder]);
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, stage, reservationId }),
      });
      const data = await res.json();
      setPhotos((p) => p.map((ph) => (ph === placeholder ? { url: data.url ?? dataUrl, uploading: false } : ph)));
    } catch {
      setPhotos((p) => p.filter((ph) => ph !== placeholder));
    }
  };

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) await addFile(file);
    e.target.value = '';
  };

  const uploading = photos.some((p) => p.uploading);
  const ready = photos.length >= minPhotos && !uploading;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between border-b border-light-gray px-4 py-3">
        <p className="font-display text-lg font-bold">{title}</p>
        <button onClick={onCancel} className="text-sm text-medium-gray">Cancel</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-sm text-medium-gray">
          {photos.length}/{minPhotos} photos {photos.length < minPhotos ? `— ${minPhotos - photos.length} more needed` : '— ready'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-card border border-light-gray bg-dark-gray">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              {p.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs">Uploading…</div>
              )}
            </div>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-card border border-dashed border-light-gray text-3xl text-medium-gray"
          >
            +
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={onFilesSelected}
        />
      </div>

      <div className="border-t border-light-gray p-4">
        <Button
          variant="primary"
          className="h-14 w-full font-display font-bold"
          disabled={!ready}
          onClick={() => onDone(photos.map((p) => p.url))}
        >
          {ready ? 'Use these photos' : `Need ${Math.max(0, minPhotos - photos.length)} more`}
        </Button>
      </div>
    </div>
  );
}
