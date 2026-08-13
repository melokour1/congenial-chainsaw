import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { formatCents } from '@laxvaletcare/shared';
import { api } from '../../../src/lib/api';
import { supabase } from '../../../src/lib/supabase';
import { useDriver } from '../../../src/lib/DriverProvider';
import { COLORS, RADII } from '../../../src/lib/theme';
import type { ValetStats } from '../../../src/lib/types';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';

export default function Profile() {
  const { profile, refreshProfile, clockOut } = useDriver();
  const [stats, setStats] = useState<ValetStats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get<ValetStats>('/api/valet/stats').then(setStats).catch(() => {});
  }, []);

  const updatePhoto = async () => {
    setUploadError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setUploadError('Camera access is needed to update your photo.');
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
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async () => {
    setPwError('');
    if (password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwStatus('saving');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPwError(error.message);
      setPwStatus('error');
    } else {
      setPwStatus('done');
      setPassword('');
      setConfirm('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

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
        {uploadError && <Text style={styles.pwError}>{uploadError}</Text>}

        <Card>
          <Text style={styles.cardTitle}>Stats</Text>
          <View style={styles.statsRow}>
            <Stat value={stats ? String(stats.allTime.jobsCompleted) : '—'} label="Jobs done" />
            <Stat value={stats?.allTime.ratingAvg != null ? stats.allTime.ratingAvg.toFixed(1) : '—'} label="Avg rating" />
            <Stat value={stats ? formatCents(stats.allTime.tipsTotalCents) : '—'} label="Tips total" />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Today</Text>
          <Row label="Jobs completed" value={stats ? String(stats.today.jobsCompleted) : '—'} />
          <Row label="Tips earned" value={stats ? formatCents(stats.today.tipsTotalCents) : '—'} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Change password</Text>
          <View style={{ gap: 8 }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm new password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />
            {pwError ? <Text style={styles.pwError}>{pwError}</Text> : null}
            {pwStatus === 'done' && <Text style={styles.pwDone}>Password updated.</Text>}
            <Button label={pwStatus === 'saving' ? 'Saving…' : 'Update password'} variant="secondary" onPress={changePassword} disabled={pwStatus === 'saving'} />
          </View>
        </Card>

        <Button label="Clock out" size="large" onPress={clockOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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
  title: {
    marginTop: 8,
    fontFamily: 'Jost_700Bold',
    fontSize: 24,
    color: COLORS.white,
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
  input: {
    height: 48,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    color: COLORS.white,
    fontSize: 14,
  },
  pwError: {
    fontSize: 12,
    color: COLORS.red,
  },
  pwDone: {
    fontSize: 12,
    color: COLORS.green,
  },
});
