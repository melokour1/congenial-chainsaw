import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { useAuth } from '../../../src/lib/AuthProvider';
import { supabase } from '../../../src/lib/supabase';
import { ScreenContainer, StepHeader, Input, Button, Card } from '../../../src/components/ui';

export default function EditAccountScreen() {
  const { theme, mode, toggle } = useTheme();
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    const { error } = await supabase.from('profiles').update({ fullName, phone: phone || null }).eq('id', profile.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      await refreshProfile();
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Account" onBack={() => router.back()} />

      <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Jane Doe" />
      <Input label="Email" value={profile?.email ?? ''} editable={false} />
      <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="(310) 555-0100" keyboardType="phone-pad" />

      {saved ? (
        <Text style={{ color: theme.colors.success, fontFamily: theme.fonts.body, marginBottom: 12 }}>Saved.</Text>
      ) : null}
      <Button label="Save changes" onPress={save} loading={saving} />

      <Card style={{ marginTop: theme.spacing(6) }}>
        <Pressable
          onPress={toggle}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: theme.minTouchTarget,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={20} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>
              {mode === 'dark' ? 'Dark mode' : 'Light mode'}
            </Text>
          </View>
          <View
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              backgroundColor: mode === 'dark' ? theme.colors.text : theme.colors.border,
              padding: 2,
              alignItems: mode === 'dark' ? 'flex-end' : 'flex-start',
            }}
          >
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.background }} />
          </View>
        </Pressable>
      </Card>
    </ScreenContainer>
  );
}
