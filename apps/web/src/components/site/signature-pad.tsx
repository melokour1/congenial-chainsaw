'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { uploadPhoto } from '@/components/site/lib/upload-photo';

export function SignaturePad({
  onSigned,
  rentalBookingId,
}: {
  onSigned: (url: string) => void;
  rentalBookingId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStrokes = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    setSaved(false);
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStrokes.current = true;
  }

  function handlePointerUp() {
    drawing.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokes.current = false;
    setSaved(false);
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas || !hasStrokes.current) {
      setError('Please sign before continuing.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const { url } = await uploadPhoto({ dataUrl, stage: 'RENTAL_PICKUP', rentalBookingId });
      setSaved(true);
      onSigned(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save signature');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full touch-none rounded-card border border-light-gray bg-white dark:border-[#2A2A2A]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button variant="secondary" type="button" className="h-11" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="primary" type="button" className="h-11" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Signed ✓' : 'Save signature'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
