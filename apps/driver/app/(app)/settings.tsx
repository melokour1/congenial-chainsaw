import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { haptics } from '../../src/lib/haptics';
import { supabase } from '../../src/lib/supabase';
import { useDriver } from '../../src/lib/DriverProvider';
import { COLORS, RADII } from '../../src/lib/theme';
import { useToast } from '../../src/lib/ToastProvider';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { ConfirmDialog } from '../../src/components/ui/ConfirmDialog';

const APP_VERSION = Constants.expoConfig?.version ?? '—';
const RUNTIME_LABEL = Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android';

export default function Settings() {
  const { clockOut } = useDriver();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving'>('idle');
  const [pwError, setPwError] = useState('');
  const [confirmClockOut, setConfirmClockOut] = useState(false);

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
    setPwStatus('idle');
    if (error) {
      setPwError(error.message);
      haptics.error();
    } else {
      setPassword('');
      setConfirm('');
      haptics.success();
      showToast('Password updated', 'success');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          <Text style={styles.backLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

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
            <Button
              label={pwStatus === 'saving' ? 'Saving…' : 'Update password'}
              variant="secondary"
              onPress={changePassword}
              disabled={pwStatus === 'saving'}
            />
          </View>
        </Card>

        <Card style={styles.aboutCard}>
          <Row label="App version" value={`${APP_VERSION} · ${RUNTIME_LABEL}`} />
        </Card>

        <Button label="Clock out" size="large" variant="danger" onPress={() => setConfirmClockOut(true)} />
      </ScrollView>

      {confirmClockOut && (
        <ConfirmDialog
          title="Clock out?"
          message="You'll be signed out and removed from the queue. Any active jobs should be completed first."
          confirmLabel="Yes, clock out"
          danger
          onConfirm={clockOut}
          onCancel={() => setConfirmClockOut(false)}
        />
      )}
    </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 15,
    color: COLORS.white,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 10,
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
  aboutCard: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
