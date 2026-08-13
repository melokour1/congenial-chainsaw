import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADII } from '../../lib/theme';
import { Button } from './Button';

interface ConfirmDialogProps {
  title: string;
  /** The literal customer-facing message, when this action sends one — shown verbatim, same as apps/web's ConfirmDialog. */
  sendMessage?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  danger?: boolean;
}

/** Every driver action button confirms via this dialog first, mirroring apps/web's ConfirmDialog. */
export function ConfirmDialog({ title, sendMessage, message, confirmLabel = 'Yes, send', cancelLabel = 'Cancel', onConfirm, onCancel, danger }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          {sendMessage && (
            <View style={styles.sendBox}>
              <Text style={styles.sendLabel}>THIS WILL SEND</Text>
              <Text style={styles.sendMessage}>&ldquo;{sendMessage}&rdquo;</Text>
            </View>
          )}
          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button label={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={loading ? 'Sending…' : confirmLabel}
                variant={danger ? 'danger' : 'primary'}
                onPress={handleConfirm}
                disabled={loading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADII.card,
    borderTopRightRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Jost_700Bold',
    fontSize: 19,
    color: COLORS.white,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  sendBox: {
    marginTop: 14,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.black,
    padding: 12,
  },
  sendLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textMuted,
  },
  sendMessage: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.white,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
});
