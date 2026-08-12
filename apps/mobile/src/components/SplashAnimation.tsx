import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const GOLD = '#E0A458';

const FADE_IN_MS = 380;
const MIN_LOADING_MS = 550; // the dot always gets at least this long on screen
const FADE_OUT_MS = 400;
const DOT_PULSE_MS = 900;

type Phase = 'intro' | 'loading' | 'exiting';

interface SplashAnimationProps {
  /** Flips to true once the real app has what it needs (e.g. the auth check
   * resolved) and it is actually safe to reveal it. */
  ready: boolean;
  onComplete: () => void;
}

/**
 * The in-JS launch sequence that plays over the native splash screen on cold
 * start (Turo-style: solid black in both, so there is no visible seam between
 * the OS-drawn splash and this taking over).
 *
 * Three phases:
 *   1. intro   — logo fades + scales in quickly.
 *   2. loading — logo holds while a small pulsing dot signals real work
 *                happening underneath. Held for at least MIN_LOADING_MS, and
 *                until `ready` flips true — whichever is longer — so the
 *                indicator always reads as genuine loading, never a fixed
 *                arbitrary delay.
 *   3. exiting — the whole overlay cross-fades out, revealing the app.
 */
export function SplashAnimation({ ready, onComplete }: SplashAnimationProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [minElapsed, setMinElapsed] = useState(false);

  const overlayOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.95);
  const dotOpacity = useSharedValue(0);
  const dotScale = useSharedValue(0.85);

  // Phase 1: fade + scale the lockup in, then hand off to the loading phase.
  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setPhase)('loading');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: start the pulsing dot loop and the minimum-hold timer.
  useEffect(() => {
    if (phase !== 'loading') return;
    dotOpacity.value = withTiming(1, { duration: 200 });
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: DOT_PULSE_MS / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: DOT_PULSE_MS / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    const timer = setTimeout(() => setMinElapsed(true), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Phase 3: once both the minimum hold and real readiness are satisfied,
  // cross-fade the whole overlay out.
  useEffect(() => {
    if (phase !== 'loading' || !minElapsed || !ready) return;
    setPhase('exiting');
    cancelAnimation(dotScale);
    overlayOpacity.value = withTiming(0, { duration: FADE_OUT_MS, easing: Easing.inOut(Easing.ease) }, (finished) => {
      if (finished) runOnJS(onComplete)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, minElapsed, ready]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.lockup, logoStyle]}>
        <Text style={styles.lax}>LAX</Text>
        <Text style={styles.valet}>Valet</Text>
        <Text style={styles.care}>CARE</Text>
      </Animated.View>
      <Animated.View style={[styles.dot, dotStyle]} />
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginTop: 28,
  },
});
