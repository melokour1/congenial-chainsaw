import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { useAuth } from '../../../src/lib/AuthProvider';
import { ScreenContainer, Card } from '../../../src/components/ui';
import { AccountRow } from '../../../src/components/account/AccountRow';
import pkg from '../../../package.json';

export default function AccountScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScreenContainer edges={['top']}>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: '700', marginBottom: 16 }}>
        Account
      </Text>

      <Card padded style={{ marginBottom: theme.spacing(5) }} onPress={() => router.push('/(tabs)/account/edit')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: theme.colors.text,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: theme.colors.inverseText, fontFamily: theme.fonts.display, fontWeight: '700', fontSize: 18 }}>
              {(profile?.fullName ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16 }}>
              {profile?.fullName ?? 'Your account'}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
              {profile?.email ?? ''}
            </Text>
          </View>
        </View>
      </Card>

      <Card padded={false} style={{ paddingHorizontal: 16 }}>
        <AccountRow icon="person-outline" label="Account" onPress={() => router.push('/(tabs)/account/edit')} />
        <AccountRow
          icon="sparkles-outline"
          label="Ask LAXValetCare"
          badge="New"
          onPress={() => router.push('/(tabs)/account/ask')}
        />
        <AccountRow icon="card-outline" label="Payment methods" onPress={() => router.push('/(tabs)/account/payment-methods')} />
        <AccountRow icon="car-outline" label="Saved vehicles" onPress={() => router.push('/(tabs)/account/saved-vehicles')} />
        <AccountRow icon="shield-checkmark-outline" label="My verification" onPress={() => router.push('/(tabs)/account/verification')} />
        <AccountRow icon="pricetag-outline" label="Promo codes" onPress={() => router.push('/(tabs)/account/promo-codes')} />
        <AccountRow icon="star-outline" label="Why choose LAXValetCare" onPress={() => router.push('/(tabs)/account/why-choose-us')} />
        <AccountRow icon="notifications-outline" label="Notification settings" onPress={() => router.push('/(tabs)/account/notifications')} />
        <AccountRow icon="document-text-outline" label="Legal" onPress={() => router.push('/(tabs)/account/legal')} />
      </Card>

      <Card padded={false} style={{ paddingHorizontal: 16, marginTop: theme.spacing(4) }}>
        <AccountRow icon="log-out-outline" label="Log out" onPress={confirmSignOut} destructive />
      </Card>

      <Text
        style={{
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
          fontSize: 12,
          textAlign: 'center',
          marginTop: theme.spacing(6),
        }}
      >
        LAXValetCare v{pkg.version}
      </Text>
    </ScreenContainer>
  );
}
