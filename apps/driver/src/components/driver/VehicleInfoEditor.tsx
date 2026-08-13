import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../lib/api';
import { COLORS, RADII } from '../../lib/theme';
import type { ReservationJob } from '../../lib/types';

type Field = 'vehicleColor' | 'vehicleMake' | 'vehicleModel' | 'transmission' | 'plate' | 'vehicleLocation';

const FIELD_LABEL: Record<Field, string> = {
  vehicleColor: 'Color',
  vehicleMake: 'Make',
  vehicleModel: 'Model',
  transmission: 'Transmission',
  plate: 'Plate',
  vehicleLocation: 'Location',
};

const FIELDS: Field[] = ['vehicleColor', 'vehicleMake', 'vehicleModel', 'transmission', 'plate', 'vehicleLocation'];

/** All vehicle fields, inline-editable — PATCH /api/reservations/[id] on save. Mirrors apps/web's VehicleInfoEditor. */
export function VehicleInfoEditor({ reservation, readOnly, onSaved }: { reservation: ReservationJob; readOnly?: boolean; onSaved: (patch: Partial<ReservationJob>) => void }) {
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (field: Field) => {
    if (readOnly) return;
    if (field === 'transmission') {
      // No native select control here — toggle directly between the two values.
      const next = reservation.transmission === 'AUTOMATIC' ? 'MANUAL' : 'AUTOMATIC';
      save(field, next);
      return;
    }
    setEditingField(field);
    setDraft(String(reservation[field] ?? ''));
  };

  const save = async (field: Field, value: string) => {
    setSaving(true);
    try {
      await api.patch(`/api/reservations/${reservation.id}`, { [field]: value });
      onSaved({ [field]: value } as Partial<ReservationJob>);
    } finally {
      setSaving(false);
      setEditingField(null);
    }
  };

  return (
    <View style={styles.grid}>
      {FIELDS.map((field) => (
        <View key={field} style={styles.tile}>
          <Text style={styles.tileLabel}>{FIELD_LABEL[field]}</Text>
          {editingField === field ? (
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onBlur={() => save(field, draft.trim())}
              onSubmitEditing={() => save(field, draft.trim())}
              editable={!saving}
              style={styles.input}
              placeholderTextColor={COLORS.textMuted}
            />
          ) : (
            <TouchableOpacity onPress={() => startEdit(field)} disabled={readOnly}>
              <Text style={styles.value} numberOfLines={1}>
                {String(reservation[field] ?? '—')}
                {field === 'transmission' && reservation.transmission === 'MANUAL' && ' ⚠️'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '47%',
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.black,
    padding: 10,
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  input: {
    marginTop: 3,
    fontSize: 14,
    color: COLORS.white,
    padding: 0,
  },
});
