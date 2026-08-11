import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../src/lib/ThemeProvider';
import { useAuth } from '../../src/lib/AuthProvider';
import { ScreenContainer, Button, Input, Logo } from '../../src/components/ui';

export default function SignInScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <Logo size="lg" />
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 16,
          color: theme.colors.textMuted,
          marginTop: 16,
          marginBottom: 32,
        }}
      >
        Sign in to book valet, rentals, and manage your trips.
      </Text>

      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
      />

      {error ? (
        <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button label="Sign In" onPress={submit} loading={loading} />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 6 }}>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body }}>New here?</Text>
        <Link href="/(auth)/sign-up" style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700' }}>
          Create an account
        </Link>
      </View>
    </ScreenContainer>
  );
}
