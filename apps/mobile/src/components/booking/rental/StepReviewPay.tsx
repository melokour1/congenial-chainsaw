import React from 'react';
import { Text, View } from 'react-native';
import type { PriceBreakdown } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Card, Divider, StepHeader } from '../../ui';

export function StepReviewPay({
  breakdown,
  onSubmit,
  onBack,
  submitting,
  submitError,
}: {
  breakdown: PriceBreakdown | null;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const { theme } = useTheme();

  return (
    <View>
      <StepHeader title="Review & pay" step={5} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Here's your full price, including any add-ons and insurance.
      </Text>

      <Card>
        {breakdown ? (
          <>
            {breakdown.lineItems.map((li, i) => (
              <Row key={i} label={li.label} detail={li.detail} value={formatCents(li.cents)} theme={theme} spaced />
            ))}
            <Divider spacing={12} />
            <Row label="Subtotal" value={formatCents(breakdown.subtotalCents)} theme={theme} muted />
            <Row label={`Tax (${breakdown.taxPct}%)`} value={formatCents(breakdown.taxCents)} theme={theme} muted />
            <Row label={`Service fee (${breakdown.serviceFeePct}%)`} value={formatCents(breakdown.serviceFeeCents)} theme={theme} muted />
            <Divider spacing={12} />
            <Row label="Total" value={formatCents(breakdown.totalCents)} theme={theme} bold />
          </>
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14 }}>Calculating price…</Text>
        )}
      </Card>

      <View style={{ marginTop: 14, padding: 12, borderRadius: theme.radii.card, backgroundColor: theme.colors.surfaceAlt }}>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12 }}>
          Payment setup pending — your rental will be created without payment for now. We'll email you a payment link
          once card payments are enabled. A security deposit hold will also be requested before pickup.
        </Text>
      </View>

      {submitError ? (
        <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 12 }}>{submitError}</Text>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <Button label={submitting ? 'Finalizing…' : 'Confirm rental'} onPress={onSubmit} disabled={submitting || !breakdown} loading={submitting} />
      </View>
    </View>
  );
}

function Row({
  label,
  detail,
  value,
  theme,
  muted,
  bold,
  spaced,
}: {
  label: string;
  detail?: string;
  value: string;
  theme: ReturnType<typeof useTheme>['theme'];
  muted?: boolean;
  bold?: boolean;
  /** Extra vertical padding + room for a detail sub-line — used for the
   * itemized charges, not the subtotal/tax/total summary rows below them. */
  spaced?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: spaced ? 8 : 4 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: muted ? theme.colors.textMuted : theme.colors.text, fontFamily: theme.fonts.body, fontSize: bold ? 15 : 14, fontWeight: bold ? '700' : spaced ? '600' : '400' }}>
          {label}
        </Text>
        {detail && (
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12, marginTop: 2 }}>
            {detail}
          </Text>
        )}
      </View>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: bold ? 15 : 14, fontWeight: bold ? '700' : '600' }}>
        {value}
      </Text>
    </View>
  );
}
