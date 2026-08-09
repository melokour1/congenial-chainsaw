import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../src/lib/ThemeProvider';
import { useAuth } from '../../src/lib/AuthProvider';
import { ScreenContainer, Button, Input } from '../../src/components/ui';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp({ email: email.trim(), password, fullName: fullName.trim(), phone: phone.trim() });
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <ScreenContainer contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Text style={{ fontFamily: theme.fonts.display, fontSize: 26, fontWeight: '700', color: theme.colors.text }}>
          Check your email
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 16, color: theme.colors.textMuted, marginTop: 8, marginBottom: 24 }}>
          We sent a confirmation link to {email}. Once verified, sign in below.
        </Text>
        <Button label="Go to Sign In" onPress={() => router.replace('/(auth)/sign-in')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 34, fontWeight: '700', color: theme.colors.text }}>
        Create your account
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 16, color: theme.colors.textMuted, marginTop: 8, marginBottom: 32 }}>
        Valet, rentals, and car care — all in one app.
      </Text>

      <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Jane Doe" autoComplete="name" />
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
      />
      <Input label="Phone (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="(310) 555-0100" />
      <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 6 characters" />

      {error ? (
        <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button label="Create Account" onPress={submit} loading={loading} />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 6 }}>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body }}>Already have an account?</Text>
        <Link href="/(auth)/sign-in" style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700' }}>
          Sign in
        </Link>
      </View>
    </ScreenContainer>
  );
}
