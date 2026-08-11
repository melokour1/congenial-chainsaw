import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { ScreenContainer, StepHeader, SegmentedControl, Card } from '../../../src/components/ui';

type Doc = 'terms' | 'privacy';

export default function LegalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [doc, setDoc] = useState<Doc>('terms');

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Legal" onBack={() => router.back()} />
      <SegmentedControl
        value={doc}
        onChange={setDoc}
        options={[
          { value: 'terms', label: 'Terms of Service' },
          { value: 'privacy', label: 'Privacy Policy' },
        ]}
      />
      <View style={{ marginTop: 20 }}>
        <Card>
          <View style={{ padding: 12, borderRadius: theme.radii.card, backgroundColor: theme.colors.surfaceAlt, marginBottom: 16 }}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 12, lineHeight: 18 }}>
              Placeholder text — not reviewed by an attorney. This will be replaced with{' '}
              {doc === 'terms' ? 'real terms' : 'a real privacy policy'} before accepting real bookings.
            </Text>
          </View>
          {doc === 'terms' ? <TermsBody theme={theme} /> : <PrivacyBody theme={theme} />}
        </Card>
      </View>
    </ScreenContainer>
  );
}

function Section({ title, body, theme }: { title: string; body: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 14, fontWeight: '700', color: theme.colors.text }}>
        {title}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 19, color: theme.colors.textMuted, marginTop: 4 }}>
        {body}
      </Text>
    </View>
  );
}

function TermsBody({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View>
      <Section
        theme={theme}
        title="1. Services"
        body="LAXValetCare provides airport valet parking, vehicle rentals, and related car care add-ons at Los Angeles International Airport (LAX). By booking, you agree to these terms."
      />
      <Section
        theme={theme}
        title="2. Bookings & payment"
        body="Prices shown at booking include the quoted service, applicable tax, and service fee. Rentals require a refundable security deposit hold."
      />
      <Section
        theme={theme}
        title="3. Vehicle care & liability"
        body="Vehicles left in our care are stored and insured for the duration of the booking, subject to policy terms to be defined. Customers are responsible for accurately describing their vehicle's condition at drop-off."
      />
      <Section theme={theme} title="4. Cancellations" body="Cancellation and refund policy to be defined." />
      <Section theme={theme} title="5. Contact" body="Questions about these terms — contact us through your account." />
    </View>
  );
}

function PrivacyBody({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View>
      <Section
        theme={theme}
        title="Information we collect"
        body="Account details (name, email, phone), booking and vehicle information, payment details (processed by Stripe — we don't store card numbers), and identity verification documents for rentals."
      />
      <Section
        theme={theme}
        title="How we use it"
        body="To provide valet and rental services, process payments, send booking notifications (email/SMS), and respond to support requests."
      />
      <Section
        theme={theme}
        title="Third parties"
        body="We use Stripe for payments, Supabase for data storage, and may use Twilio, Resend, and Firebase for notifications. Each processes data under their own privacy policies."
      />
      <Section
        theme={theme}
        title="Your rights"
        body="You can view and update your account details at any time, or contact us to request deletion of your data, subject to legal retention requirements."
      />
    </View>
  );
}
