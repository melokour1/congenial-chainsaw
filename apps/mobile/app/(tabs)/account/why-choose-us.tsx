import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { ScreenContainer, StepHeader, Card, Divider, Button } from '../../../src/components/ui';

const BADGES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'business-outline', label: 'Indoor parking' },
  { icon: 'shield-checkmark-outline', label: 'Insured' },
  { icon: 'location-outline', label: 'Real-time updates' },
  { icon: 'star-outline', label: '5-star reviews' },
];

const STEPS = [
  {
    number: '01',
    title: 'Book online in under 2 minutes',
    body: "Tell us where you're flying from, your dates, and your car. Get a firm price before you commit — no surprise fees at the curb.",
  },
  {
    number: '02',
    title: 'Drop your keys curbside',
    body: 'Pull up to departures, hand off your keys, and go. Your car is stored indoors and insured for the length of your trip.',
  },
  {
    number: '03',
    title: 'Tell us "on my way" and it is ready',
    body: 'When you land, tell us your ETA. Your car is washed, charged if needed, and waiting curbside by the time you get there.',
  },
];

export default function WhyChooseUsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Why choose LAXValetCare" onBack={() => router.back()} />

      <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 21, color: theme.colors.textMuted, marginTop: -8, marginBottom: 20 }}>
        Airport valet at LAX shouldn't mean surprise fees, long waits, or wondering where your car actually is
        while you're gone. So we rebuilt it — firm pricing before you book, your car stored indoors and insured
        for the length of your trip, and live tracking so you always know when it'll be curbside.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {BADGES.map((b) => (
          <View
            key={b.label}
            style={{
              flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
              padding: 12, borderRadius: theme.radii.card, backgroundColor: theme.colors.surfaceAlt,
            }}
          >
            <Ionicons name={b.icon} size={20} color={theme.colors.text} />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, fontWeight: '700', color: theme.colors.text, flexShrink: 1 }}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: theme.fonts.display, fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 }}>
        How it works
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted, marginBottom: 16 }}>
        Three steps between you and a curbside car.
      </Text>

      <Card>
        {STEPS.map((s, i) => (
          <View key={s.number}>
            <View style={{ paddingVertical: 4 }}>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 12, fontWeight: '700', color: theme.colors.textMuted }}>
                {s.number}
              </Text>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 4 }}>
                {s.title}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 19, color: theme.colors.textMuted, marginTop: 4 }}>
                {s.body}
              </Text>
            </View>
            {i < STEPS.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </Card>

      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 20, color: theme.colors.textMuted, marginTop: 20, marginBottom: 20 }}>
        Alongside valet, we run a small fleet of rental vehicles for LAX travelers who need a car instead of
        leaving one behind, plus car care add-ons — hand wash, full detail, EV charging — while your car is in
        our care. We're based at LAX and currently serve all terminals, plus off-site pickup for JSX and
        Atlantic Aviation.
      </Text>

      <Button label="Book a valet" onPress={() => router.push('/book/valet/origin')} />
    </ScreenContainer>
  );
}
