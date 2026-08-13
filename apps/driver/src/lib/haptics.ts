import * as Haptics from 'expo-haptics';

// expo-haptics throws on web (no Vibration API bridge) — every call site in
// this app fires these from the same handlers that also run on the Expo web
// export, so swallow rather than making every caller guard for it.
function safe(fn: () => Promise<void>) {
  fn().catch(() => {});
}

export const haptics = {
  /** A new job offer arriving, or the alarm's countdown ticking down — something needs attention now. */
  alert: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /** A job action, clock in/out, or status change completed successfully. */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** An action failed. */
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  /** A routine tap — accepting/declining, toggling a filter, opening a job. */
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
};
