import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetwork } from '../../lib/NetworkProvider';
import { COLORS } from '../../lib/theme';

/** Persistent banner while the device has no connectivity — mounted once at the app shell. */
export function OfflineBanner() {
  const { isConnected } = useNetwork();
  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.text}>No connection — actions won&rsquo;t reach LAXValetCare until you&rsquo;re back online</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2A1414',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,91,91,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
  },
});
