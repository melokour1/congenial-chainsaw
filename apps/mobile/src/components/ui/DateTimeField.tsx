import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../lib/ThemeProvider';
import { formatDateTime } from '../../lib/format';

interface DateTimeFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

/**
 * Cross-platform date+time picker. iOS/Android use the native community picker
 * (date step, then time step). Web has no native datetime widget in RN, so it
 * falls back to the platform's own <input type="datetime-local"> via a plain
 * HTML element — same control the web app itself uses.
 */
export function DateTimeField({ label, value, onChange, minimumDate }: DateTimeFieldProps) {
  const { theme } = useTheme();
  const [stage, setStage] = useState<'none' | 'date' | 'time'>('none');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={{ marginBottom: theme.spacing(4) }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textMuted, fontFamily: theme.fonts.body, marginBottom: 6 }}>
          {label}
        </Text>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <input
          type="datetime-local"
          value={value ? toLocalInputValue(value) : ''}
          min={minimumDate ? toLocalInputValue(minimumDate) : undefined}
          onChange={(e: any) => {
            const v = e.target.value;
            if (v) onChange(new Date(v));
          }}
          style={{
            minHeight: theme.minTouchTarget,
            borderRadius: theme.radii.card,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            fontSize: 16,
            padding: '0 14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: theme.spacing(4) }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textMuted, fontFamily: theme.fonts.body, marginBottom: 6 }}>
        {label}
      </Text>
      <Pressable
        onPress={() => setStage('date')}
        style={{
          minHeight: theme.minTouchTarget,
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          justifyContent: 'center',
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ color: value ? theme.colors.text : theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 16 }}>
          {value ? formatDateTime(value) : 'Select date & time'}
        </Text>
      </Pressable>

      {stage === 'date' && (
        <DateTimePicker
          value={value ?? pendingDate ?? new Date()}
          mode="date"
          minimumDate={minimumDate}
          onChange={(event, date) => {
            if (event.type === 'dismissed' || !date) {
              setStage('none');
              return;
            }
            setPendingDate(date);
            setStage('time');
          }}
        />
      )}
      {stage === 'time' && (
        <DateTimePicker
          value={pendingDate ?? value ?? new Date()}
          mode="time"
          onChange={(event, date) => {
            setStage('none');
            if (event.type === 'dismissed' || !date || !pendingDate) return;
            const combined = new Date(pendingDate);
            combined.setHours(date.getHours(), date.getMinutes());
            onChange(combined);
          }}
        />
      )}
    </View>
  );
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
