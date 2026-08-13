import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../lib/api';
import { ADD_ON_LABEL } from '../../lib/actionCopy';
import { COLORS, RADII } from '../../lib/theme';
import type { AddOn, ReservationJob } from '../../lib/types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CameraCaptureSheet } from './CameraCaptureSheet';

/** Collapsible "Service updates" checklist — only the add-ons actually on this reservation. Mirrors apps/web's AddOnChecklist. */
export function AddOnChecklist({ reservation, readOnly, onCompleted }: { reservation: ReservationJob; readOnly?: boolean; onCompleted: (addOnId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<AddOn | null>(null);
  const [step, setStep] = useState<'confirm' | 'photos' | null>(null);

  if (reservation.addOns.length === 0) return null;

  const startFlow = (addOn: AddOn) => {
    if (readOnly || addOn.status === 'COMPLETE') return;
    setPending(addOn);
    setStep('confirm');
  };

  const finish = async () => {
    if (!pending) return;
    await api.post(`/api/valet/addons/${pending.id}/complete`);
    onCompleted(pending.id);
    setPending(null);
    setStep(null);
  };

  const doneCount = reservation.addOns.filter((a) => a.status === 'COMPLETE').length;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.header} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.headerLabel}>{open ? '▼' : '▶'} Service updates</Text>
        <Text style={styles.headerCount}>{doneCount}/{reservation.addOns.length} done</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.list}>
          {reservation.addOns.map((addOn) => (
            <TouchableOpacity
              key={addOn.id}
              onPress={() => startFlow(addOn)}
              disabled={readOnly || addOn.status === 'COMPLETE'}
              style={styles.row}
            >
              <Text style={styles.rowLabel}>{ADD_ON_LABEL[addOn.type] ?? addOn.type}</Text>
              <Text style={[styles.rowStatus, addOn.status === 'COMPLETE' && { color: COLORS.green }]}>
                {addOn.status === 'COMPLETE' ? '✓ Complete' : 'Mark complete'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {pending && step === 'confirm' && (
        <ConfirmDialog
          title={`Complete ${ADD_ON_LABEL[pending.type] ?? pending.type}?`}
          sendMessage={`Your ${ADD_ON_LABEL[pending.type] ?? pending.type} is complete ✨`}
          onConfirm={() => setStep('photos')}
          onCancel={() => { setPending(null); setStep(null); }}
        />
      )}

      {pending && step === 'photos' && (
        <CameraCaptureSheet
          title={`${ADD_ON_LABEL[pending.type] ?? pending.type} — photos`}
          minPhotos={1}
          stage="ADDON"
          reservationId={reservation.id}
          onDone={finish}
          onCancel={() => { setPending(null); setStep(null); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 8,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.white,
  },
  rowStatus: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
