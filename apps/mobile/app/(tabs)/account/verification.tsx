import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { useAuth } from '../../../src/lib/AuthProvider';
import { supabase } from '../../../src/lib/supabase';
import { ScreenContainer, StepHeader, Card, Badge, Button, EmptyState } from '../../../src/components/ui';

interface VerificationRow {
  fullLegalName: string;
  dlNumber: string;
  dlState: string;
  dlExpiry: string;
  faceMatchStatus: 'PENDING' | 'MATCHED' | 'FAILED' | 'MANUAL_REVIEW';
  verifiedAt: string | null;
}

const STATUS_COPY: Record<VerificationRow['faceMatchStatus'], { label: string; variant: 'success' | 'default' | 'danger'; body: string }> = {
  MATCHED: { label: 'Verified', variant: 'success', body: 'Your identity is verified — future rentals skip this step.' },
  PENDING: { label: 'Under review', variant: 'default', body: 'We\'re reviewing your documents. This usually takes a few minutes.' },
  MANUAL_REVIEW: { label: 'Manual review', variant: 'default', body: 'Our team is reviewing your documents by hand.' },
  FAILED: { label: 'Needs attention', variant: 'danger', body: 'We couldn\'t verify your documents — please re-submit during your next rental.' },
};

export default function VerificationScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const [row, setRow] = useState<VerificationRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('rental_verifications')
      .select('fullLegalName, dlNumber, dlState, dlExpiry, faceMatchStatus, verifiedAt')
      .eq('customerId', profile.id)
      .maybeSingle()
      .then(({ data }) => setRow((data as VerificationRow) ?? null))
      .finally(() => setLoading(false));
  }, [profile]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="My verification" onBack={() => router.back()} />

      {loading ? null : !row ? (
        <EmptyState
          icon="shield-outline"
          title="Not verified yet"
          body="Identity verification happens during your first rental booking — driver's license + a quick selfie."
          actionLabel="Start a rental"
          onAction={() => router.push('/book/rental/dates')}
        />
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.text} />
            <Badge label={STATUS_COPY[row.faceMatchStatus].label} variant={STATUS_COPY[row.faceMatchStatus].variant} />
          </View>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 10 }}>
            {STATUS_COPY[row.faceMatchStatus].body}
          </Text>
          <View style={{ marginTop: 16, gap: 8 }}>
            <DetailLine label="Name" value={row.fullLegalName} theme={theme} />
            <DetailLine label="License" value={`${row.dlNumber} (${row.dlState})`} theme={theme} />
            <DetailLine label="Expires" value={new Date(row.dlExpiry).toLocaleDateString()} theme={theme} />
          </View>
        </Card>
      )}
    </ScreenContainer>
  );
}

function DetailLine({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 13, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}
