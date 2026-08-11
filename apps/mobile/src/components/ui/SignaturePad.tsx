import React, { useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../lib/ThemeProvider';
import { api } from '../../lib/api';
import { Button } from './Button';

const WIDTH = 600;
const HEIGHT = 200;

/**
 * Freehand signature capture — draws into an SVG path (via react-native-svg, already a
 * dependency), then on save serializes that path into a standalone SVG document and uploads
 * it through the same POST /api/photos contract apps/web's canvas-based signature pad uses,
 * so the result is a real image URL either way, not a placeholder.
 *
 * Platform-branched like DateTimeField: native uses PanResponder (the standard RN gesture
 * API). Web instead binds raw pointer events directly — react-native-web's PanResponder
 * shim negotiates through React's synthetic top-level listeners, which loses the gesture to
 * the surrounding ScreenContainer ScrollView more often than plain onPointerDown/Move/Up
 * (bound straight to this View's underlying div) does.
 */
export function SignaturePad({
  onSigned,
  rentalBookingId,
}: {
  onSigned: (url: string) => void;
  rentalBookingId?: string;
}) {
  const { theme } = useTheme();
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef<string>('');
  const drawing = useRef(false);
  const [, forceRender] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function begin(x: number, y: number) {
    currentPath.current = `M${x.toFixed(1)},${y.toFixed(1)}`;
    setSaved(false);
    forceRender((n) => n + 1);
  }
  function extend(x: number, y: number) {
    currentPath.current += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    forceRender((n) => n + 1);
  }
  function end() {
    if (currentPath.current) {
      setPaths((prev) => [...prev, currentPath.current]);
      currentPath.current = '';
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => begin(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) => extend(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderRelease: end,
    }),
  ).current;

  // Web-only pointer handlers (see comment above); harmless no-ops passed through by
  // react-native-web on native platforms since they're never invoked there.
  const webHandlers =
    Platform.OS === 'web'
      ? {
          onPointerDown: (e: any) => {
            drawing.current = true;
            begin(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          },
          onPointerMove: (e: any) => {
            if (!drawing.current) return;
            extend(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          },
          onPointerUp: () => {
            drawing.current = false;
            end();
          },
          onPointerLeave: () => {
            if (!drawing.current) return;
            drawing.current = false;
            end();
          },
        }
      : {};

  function handleClear() {
    setPaths([]);
    currentPath.current = '';
    setSaved(false);
    forceRender((n) => n + 1);
  }

  async function handleSave() {
    if (paths.length === 0) {
      setError('Please sign before continuing.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const strokes = paths.map((d) => `<path d="${d}" stroke="#000000" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><rect width="100%" height="100%" fill="#ffffff"/>${strokes}</svg>`;
      const dataUrl = `data:image/svg+xml;base64,${base64Encode(svg)}`;
      const json = await api.post<{ id: string; url: string }>('/api/photos', { dataUrl, stage: 'RENTAL_PICKUP', rentalBookingId });
      setSaved(true);
      onSigned(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save signature');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <View
        {...(Platform.OS === 'web' ? webHandlers : panResponder.panHandlers)}
        style={[styles.canvas, { borderColor: theme.colors.border, borderRadius: theme.radii.card }]}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke="#000000" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentPath.current ? (
            <Path d={currentPath.current} stroke="#000000" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Button label="Clear" variant="secondary" size="small" onPress={handleClear} fullWidth={false} />
        <Button label={saving ? 'Saving…' : saved ? 'Signed ✓' : 'Save signature'} variant="primary" size="small" onPress={handleSave} loading={saving} fullWidth={false} />
      </View>
      {error ? <Text style={{ color: theme.colors.danger, fontSize: 13, fontFamily: theme.fonts.body, marginTop: 8 }}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    aspectRatio: WIDTH / HEIGHT,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    overflow: 'hidden',
  },
});

/**
 * Hermes (native RN's JS engine) has no `btoa` and this codebase doesn't otherwise depend on
 * a `Buffer` polyfill, so we can't reach for either to base64-encode the SVG string — a small
 * self-contained encoder avoids adding a dependency just for this one call site.
 */
function base64Encode(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new TextEncoder().encode(input);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    result += b1 === undefined ? '=' : chars[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    result += b2 === undefined ? '=' : chars[b2 & 63];
  }
  return result;
}
