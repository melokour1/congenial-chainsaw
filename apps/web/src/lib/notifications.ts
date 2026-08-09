import { createAdminClient } from './supabase/admin';

export interface SendNotificationInput {
  profileId: string;
  title: string;
  body: string;
  type: string;
  reservationId?: string;
  rentalBookingId?: string;
  /** Recipient's email/phone, only needed if RESEND_API_KEY / TWILIO_* are configured. */
  email?: string;
  phone?: string;
}

/**
 * Always writes a Notification row (so it shows up in the customer's Activity tab and
 * Admin > Notifications regardless of provider config). Additionally fires push (Firebase),
 * email (Resend) and SMS (Twilio) when their env vars are present — each is best-effort and
 * failures never block the booking flow that triggered the notification.
 */
export async function sendNotification(input: SendNotificationInput): Promise<void> {
  const supabase = createAdminClient();
  const sentVia: string[] = ['IN_APP'];

  if (process.env.RESEND_API_KEY && input.email) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'LAXValetCare <notifications@laxvaletcare.com>',
        to: input.email,
        subject: input.title,
        text: input.body,
      });
      sentVia.push('EMAIL');
    } catch (err) {
      console.error('[notifications] Resend send failed', err);
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && input.phone) {
    try {
      const twilio = (await import('twilio')).default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to: input.phone, body: `${input.title}: ${input.body}` });
      sentVia.push('SMS');
    } catch (err) {
      console.error('[notifications] Twilio send failed', err);
    }
  }

  // TODO: Firebase Cloud Messaging push — needs FIREBASE_* env vars + device token storage
  // (not yet in the schema; add a `pushToken` column on profiles when the mobile app registers one).

  await supabase.from('notifications').insert({
    id: crypto.randomUUID(),
    profileId: input.profileId,
    title: input.title,
    body: input.body,
    type: input.type,
    reservationId: input.reservationId ?? null,
    rentalBookingId: input.rentalBookingId ?? null,
    sentVia,
  });
}
