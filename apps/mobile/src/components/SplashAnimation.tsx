import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const GOLD = '#E0A458';

const FADE_IN_MS = 600;
const HOLD_MS = 1200;
const FADE_OUT_MS = 450;

/**
 * The in-JS launch animation that plays over the native splash screen on cold
 * start (Turo-style: solid black in both, so there is no visible seam between
 * the OS-drawn splash and this taking over). Rendered as a full-bleed overlay
 * on top of the real app so the app can mount and do its own async work (auth
 * check, etc.) underneath while this plays, rather than blocking on it.
 */
export function SplashAnimation({ onComplete }: { onComplete: () => void }) {
  // Opacity drives the whole overlay — backdrop and logo cross-fade together,
  // which is also what makes the "fade out to reveal home screen" moment work.
  // Scale only ever applies to the logo itself.
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    scale.value = withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.cubic) });
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.cubic) }),
      withDelay(
        HOLD_MS,
        withTiming(0, { duration: FADE_OUT_MS, easing: Easing.inOut(Easing.ease) }, (finished) => {
          if (finished) runOnJS(onComplete)();
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.lockup, logoStyle]}>
        <Text style={styles.lax}>LAX</Text>
        <Text style={styles.valet}>Valet</Text>
        <Text style={styles.care}>CARE</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  lockup: {
    alignItems: 'center',
  },
  lax: {
    fontFamily: 'Jost_700Bold',
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 6,
  },
  valet: {
    fontFamily: 'PlayfairDisplay_700Bold_Italic',
    color: GOLD,
    fontSize: 62,
    lineHeight: 74,
    marginVertical: 2,
  },
  care: {
    fontFamily: 'Jost_700Bold',
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 6,
  },
});
