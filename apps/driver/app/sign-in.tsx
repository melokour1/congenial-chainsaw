import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/AuthProvider';
import { COLORS, RADII } from '../src/lib/theme';
import { Button } from '../src/components/ui/Button';
import { Logo } from '../src/components/ui/Logo';

export default function SignIn() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Redirect href="/(app)" />;

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.center}>
          <Logo size="lg" style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={styles.eyebrow}>DRIVER</Text>
          <Text style={styles.title}>Sign in to start your shift</Text>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button label={loading ? 'Signing in…' : 'Sign in'} size="large" onPress={handleSignIn} loading={loading} style={{ marginTop: 4 }} />
          </View>

          <Text style={styles.footnote}>Driver accounts are set up by LAXValetCare staff. Contact your manager if you need one.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  eyebrow: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.gold,
  },
  title: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Jost_700Bold',
    fontSize: 22,
    color: COLORS.white,
  },
  form: {
    marginTop: 32,
    gap: 12,
  },
  input: {
    height: 52,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    color: COLORS.white,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
    color: COLORS.red,
  },
  footnote: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    paddingHorizontal: 12,
  },
});
