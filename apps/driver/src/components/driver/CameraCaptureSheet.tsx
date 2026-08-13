import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, ApiError } from '../../lib/api';
import { haptics } from '../../lib/haptics';
import { COLORS, RADII } from '../../lib/theme';
import { Button } from '../ui/Button';

interface CameraCaptureSheetProps {
  title: string;
  minPhotos?: number;
  stage: 'PICKUP' | 'RETURN' | 'ADDON';
  reservationId: string;
  onDone: (photoUrls: string[]) => void;
  onCancel: () => void;
  /** True while the caller's own onDone is still in flight (e.g. posting the
   * job action this photo set unblocks) — disables the submit button so a
   * slow network can't be double-tapped into two submissions. */
  submitting?: boolean;
}

/**
 * Native equivalent of apps/web's PhotoCaptureSheet — same contract (POST
 * /api/photos with a base64 data URL, get back a public URL) but backed by
 * the real device camera (ImagePicker.launchCameraAsync) instead of a
 * <input capture="environment"> file picker, which is the closest a mobile
 * browser can get. Vehicle condition photos are evidentiary, so the live
 * camera — not the photo library — is the only source here.
 */
export function CameraCaptureSheet({ title, minPhotos = 4, stage, reservationId, onDone, onCancel, submitting }: CameraCaptureSheetProps) {
  const [photos, setPhotos] = useState<{ url: string; uploading: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera access is needed to take these photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
    if (result.canceled || !result.assets[0]?.base64) return;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;

    const placeholder = { url: dataUrl, uploading: true };
    setPhotos((p) => [...p, placeholder]);
    try {
      const data = await api.post<{ url: string }>('/api/photos', { dataUrl, stage, reservationId });
      setPhotos((p) => p.map((ph) => (ph === placeholder ? { url: data.url ?? dataUrl, uploading: false } : ph)));
      haptics.tap();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Upload failed — try this photo again.');
      setPhotos((p) => p.filter((ph) => ph !== placeholder));
      haptics.error();
    }
  };

  const uploading = photos.some((p) => p.uploading);
  const ready = photos.length >= minPhotos && !uploading && !submitting;

  return (
    <Modal animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onCancel}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.progress}>
            {photos.length}/{minPhotos} photos {photos.length < minPhotos ? `— ${minPhotos - photos.length} more needed` : '— ready'}
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.grid}>
            {photos.map((p, i) => (
              <View key={i} style={styles.tile}>
                <Image source={{ uri: p.url }} style={styles.image} resizeMode="cover" />
                {p.uploading && (
                  <View style={styles.uploadingOverlay}>
                    <Text style={styles.uploadingText}>Uploading…</Text>
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={takePhoto} style={[styles.tile, styles.addTile]}>
              <Text style={styles.addIcon}>📷</Text>
              <Text style={styles.addLabel}>Take photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={submitting ? 'Submitting…' : ready ? 'Use these photos' : `Need ${Math.max(0, minPhotos - photos.length)} more`}
            size="large"
            disabled={!ready}
            loading={submitting}
            onPress={() => onDone(photos.map((p) => p.url))}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 17,
    color: COLORS.white,
    flex: 1,
    marginRight: 12,
  },
  cancel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  progress: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  error: {
    fontSize: 13,
    color: COLORS.red,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: RADII.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: COLORS.white,
    fontSize: 11,
  },
  addTile: {
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
  },
  addLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
});
