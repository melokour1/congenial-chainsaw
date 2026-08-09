import type { ReservationJob } from './types';

/**
 * Mirrors the TRANSITIONS map in app/api/reservations/[id]/actions/route.ts exactly — the
 * preview text shown in the confirm dialog MUST match what the customer actually receives
 * (spec 4.6). Keep these two files in sync.
 */
export type ActionType =
  | 'HEADING_TO_TERMINAL'
  | 'AT_CURBSIDE_DEPARTURE'
  | 'VEHICLE_RECEIVED'
  | 'HEADING_WITH_VEHICLE'
  | 'AT_CURBSIDE_RETURN'
  | 'VEHICLE_DELIVERED';

export const DEPARTURE_SEQUENCE: ActionType[] = ['HEADING_TO_TERMINAL', 'AT_CURBSIDE_DEPARTURE', 'VEHICLE_RECEIVED'];
export const RETURN_SEQUENCE: ActionType[] = ['HEADING_WITH_VEHICLE', 'AT_CURBSIDE_RETURN', 'VEHICLE_DELIVERED'];

export const ACTION_COPY: Record<ActionType, { buttonLabel: string; confirmTitle: string; body: (r: ReservationJob) => string }> = {
  HEADING_TO_TERMINAL: {
    buttonLabel: "I'M HEADING TO TERMINAL",
    confirmTitle: 'Heading to terminal?',
    body: () => 'Your valet is heading to your terminal now',
  },
  AT_CURBSIDE_DEPARTURE: {
    buttonLabel: "I'M AT THE CURBSIDE",
    confirmTitle: 'At the curbside?',
    body: (r) => `Your valet is waiting at Terminal ${r.terminal?.code ?? ''} curbside`,
  },
  VEHICLE_RECEIVED: {
    buttonLabel: 'VEHICLE RECEIVED',
    confirmTitle: 'Vehicle received?',
    body: () => 'Safe travels! Your vehicle is parked securely.',
  },
  HEADING_WITH_VEHICLE: {
    buttonLabel: "I'M HEADING WITH VEHICLE",
    confirmTitle: 'Heading with vehicle?',
    body: () => 'Your car is on its way',
  },
  AT_CURBSIDE_RETURN: {
    buttonLabel: "I'M AT THE CURBSIDE",
    confirmTitle: 'At the curbside?',
    body: (r) => `Your car is here! Your valet at Terminal ${r.terminal?.code ?? ''}`,
  },
  VEHICLE_DELIVERED: {
    buttonLabel: 'VEHICLE DELIVERED',
    confirmTitle: 'Vehicle delivered?',
    body: () => 'Your car has been delivered — please rate your trip and leave a tip for your valet.',
  },
};

export const ADD_ON_LABEL: Record<string, string> = {
  HAND_WASH: 'Hand Wash',
  FULL_DETAIL: 'Full Detail',
  EV_CHARGE: 'EV Charge',
  GAS_FILL_UP: 'Gas Fill-Up',
};

/** True while this leg still has an unfinished action button (used by the "Needs Action" filter). */
export function assignmentNeedsAction(type: 'DEPARTURE' | 'RETURN', activityLogs: { action: string }[]): boolean {
  const sequence = type === 'DEPARTURE' ? DEPARTURE_SEQUENCE : RETURN_SEQUENCE;
  const done = new Set(activityLogs.map((l) => l.action));
  return sequence.some((a) => !done.has(a));
}
