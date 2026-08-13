import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { formatCents } from '@laxvaletcare/shared';
import { api, ApiError } from '../../../src/lib/api';
import { haptics } from '../../../src/lib/haptics';
import { useDriver } from '../../../src/lib/DriverProvider';
import { withRetry } from '../../../src/lib/retry';
import { COLORS } from '../../../src/lib/theme';
import { useToast } from '../../../src/lib/ToastProvider';
import type { ValetStats } from '../../../src/lib/types';
import { Card } from '../../../src/components/ui/Card';
import { Skeleton } from '../../../src/components/ui/Skeleton';

export default function Profile() {
  const { profile, refreshProfile } = useDriver();
  const { showToast } = useToast();
  const [stats, setStats] = useState<ValetStats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = () => withRetry(() => api.get<ValetStats>('/api/valet/stats')).then(setStats).catch(() => {});

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), refreshProfile()]);
    setRefreshing(false);
  };

  const updatePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showToast('Camera access is needed to update your photo.', 'error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      cameraType: ImagePicker.CameraType.front,
    });
    if (result.canceled || !result.assets[0]?.base64) return;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;

    setUploading(true);
    try {
      await api.patch('/api/valet/photo', { dataUrl });
      await refreshProfile();
      haptics.success();
      showToast('Profile photo updated', 'success');
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Upload failed — try again.', 'error');
      haptics.error();
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor={COLORS.white} refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/settings')} hitSlop={10} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Card style={styles.profileCard}>
          <TouchableOpacity onPress={updatePhoto} disabled={uploading} style={styles.avatarWrap}>
            {profile.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{profile.fullName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditIcon}>{uploading ? '…' : '✎'}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            {profile.phone && <Text style={styles.email}>{profile.phone}</Text>}
            {!profile.photoUrl && <Text style={styles.warning}>⚠️ Add a profile photo</Text>}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Stats</Text>
          <View style={styles.statsRow}>
            <Stat value={stats ? String(stats.allTime.jobsCompleted) : null} label="Jobs done" />
            <Stat value={stats ? (stats.allTime.ratingAvg != null ? stats.allTime.ratingAvg.toFixed(1) : '—') : null} label="Avg rating" />
            <Stat value={stats ? formatCents(stats.allTime.tipsTotalCents) : null} label="Tips total" />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Today</Text>
          <Row label="Jobs completed" value={stats ? String(stats.today.jobsCompleted) : null} />
          <Row label="Tips earned" value={stats ? formatCents(stats.today.tipsTotalCents) : null} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string | null; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {value === null ? <Skeleton width={36} height={20} style={{ marginBottom: 2 }} /> : <Text style={styles.statValue}>{value}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value === null ? <Skeleton width={48} height={14} /> : <Text style={styles.rowValue}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
    gap: 14,
  },
  titleRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  settingsButton: {
    padding: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarInitial: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 12,
    color: COLORS.black,
  },
  name: {
    fontFamily: 'Jost_700Bold',
    fontSize: 17,
    color: COLORS.white,
  },
  email: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  warning: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#E0C458',
  },
  cardTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statValue: {
    fontFamily: 'Jost_700Bold',
    fontSize: 20,
    color: COLORS.white,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.white,
  },
});
