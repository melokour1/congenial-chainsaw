import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../lib/ThemeProvider';
import { api } from '../../lib/api';

type PhotoStage = 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN';

interface PhotoPickerTileProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  stage: PhotoStage;
  reservationId?: string;
  rentalBookingId?: string;
}

/**
 * Native equivalent of apps/web's PhotoUploadTile — same contract (POST /api/photos with a
 * base64 data URL, get back a public/signed URL), just sourced from the device camera roll
 * or camera instead of an <input type="file">.
 */
export function PhotoPickerTile({ label, value, onChange, stage, reservationId, rentalBookingId }: PhotoPickerTileProps) {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to upload this.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets[0]?.base64) return;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;

    setUploading(true);
    try {
      const json = await api.post<{ id: string; url: string }>('/api/photos', { dataUrl, stage, reservationId, rentalBookingId });
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textMuted, fontFamily: theme.fonts.body, marginBottom: 6 }}>
        {label}
      </Text>
      <Pressable
        onPress={pick}
        style={[
          styles.tile,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.mode === 'dark' ? '#141414' : theme.colors.surfaceAlt,
            borderRadius: theme.radii.card,
          },
        ]}
      >
        {value ? (
          <Image source={{ uri: value }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, color: theme.colors.textMuted }}>+</Text>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted, fontFamily: theme.fonts.body, marginTop: 4, textAlign: 'center', paddingHorizontal: 12 }}>
              {uploading ? 'Uploading…' : 'Tap to upload photo'}
            </Text>
          </View>
        )}
      </Pressable>
      {error ? <Text style={{ color: theme.colors.danger, fontSize: 12, fontFamily: theme.fonts.body, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 4 / 3,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
