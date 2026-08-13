import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADII } from './theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  anim: Animated.Value;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const DURATION_MS: Record<ToastType, number> = {
  success: 2500,
  info: 2500,
  error: 4500, // errors get more time to read — often the driver needs to decide whether to retry
};

/**
 * Lightweight, auto-dismissing confirmations ("Photo uploaded", "Status
 * updated") and — more importantly — the surface every fallible action in
 * this app reports to when it fails silently would otherwise be a dead tap.
 * Mounted once at the root so it's available from the sign-in screen through
 * every authenticated screen.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${counter.current++}`;
    const anim = new Animated.Value(0);
    setToasts((prev) => [...prev, { id, type, message, anim }]);

    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();

    setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => dismiss(id));
    }, DURATION_MS[type]);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.stack} pointerEvents="box-none">
          {toasts.map((t) => (
            <Animated.View
              key={t.id}
              style={[
                styles.toast,
                TYPE_STYLE[t.type],
                {
                  opacity: t.anim,
                  transform: [{ translateY: t.anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                },
              ]}
            >
              <TouchableOpacity onPress={() => dismiss(t.id)} activeOpacity={0.8}>
                <Text style={styles.message}>{t.message}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

const TYPE_STYLE = StyleSheet.create({
  success: { borderColor: 'rgba(61,220,132,0.4)', backgroundColor: '#0F2418' },
  error: { borderColor: 'rgba(255,91,91,0.5)', backgroundColor: '#2A1414' },
  info: { borderColor: COLORS.border, backgroundColor: COLORS.surface },
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  stack: {
    paddingHorizontal: 16,
    paddingBottom: 76, // clears the tab bar
    gap: 8,
  },
  toast: {
    borderRadius: RADII.card,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
