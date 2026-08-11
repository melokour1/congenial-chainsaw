import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { PriceBreakdown } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Card, Input, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

export function StepReviewPay({
  data,
  update,
  breakdown,
  onSubmit,
  onBack,
  submitting,
  submitError,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  breakdown: PriceBreakdown | null;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const { theme } = useTheme();

  return (
    <View>
      <StepHeader title="Review & pay" step={6} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Confirm your price before booking.
      </Text>

      <Card>
        {breakdown ? (
          <>
            {breakdown.lineItems.map((li, i) => (
              <Row key={i} label={li.label} value={formatCents(li.cents)} theme={theme} />
            ))}
            <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 10 }} />
            <Row label="Subtotal" value={formatCents(breakdown.subtotalCents)} muted theme={theme} />
            <Row label="Tax" value={formatCents(breakdown.taxCents)} muted theme={theme} />
            <Row label="Service fee" value={formatCents(breakdown.serviceFeeCents)} muted theme={theme} />
            {breakdown.gratuityCents > 0 && <Row label="Gratuity" value={formatCents(breakdown.gratuityCents)} muted theme={theme} />}
            <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 10 }} />
            <Row label="Total" value={formatCents(breakdown.totalCents)} bold theme={theme} />
          </>
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14 }}>Calculating price…</Text>
        )}
      </Card>

      <View style={{ marginTop: 16 }}>
        <Input
          label="Promo code"
          autoCapitalize="characters"
          value={data.promoCode}
          onChangeText={(v) => update({ promoCode: v.toUpperCase() })}
          placeholder="e.g. FIRSTVALET"
        />
      </View>

      <Card style={{ marginTop: 4 }}>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12 }}>
          Payment setup pending — your booking will be created without payment for now. We'll email you a payment link once card payments are enabled.
        </Text>
      </Card>

      {submitError && (
        <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 12 }}>{submitError}</Text>
      )}

      <View style={{ marginTop: 16 }}>
        <Button label={submitting ? 'Booking…' : 'Confirm booking'} onPress={onSubmit} disabled={submitting || !breakdown} loading={submitting} />
      </View>
    </View>
  );
}

function Row({ label, value, muted, bold, theme }: { label: string; value: string; muted?: boolean; bold?: boolean; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: bold ? 17 : 13, fontWeight: bold ? '700' : '400', color: muted ? theme.colors.textMuted : theme.colors.text }}>
        {label}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: bold ? 17 : 13, fontWeight: bold ? '700' : '600', color: theme.colors.text }}>
        {value}
      </Text>
    </View>
  );
}
