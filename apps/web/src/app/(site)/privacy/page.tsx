export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 rounded-card border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          Placeholder text — not reviewed by an attorney. Replace this page with a real privacy policy (covering
          your actual data practices and any legal requirements, e.g. CCPA) before accepting real bookings.
        </p>

        <div className="mt-8 flex flex-col gap-6 text-sm text-medium-gray">
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">Information we collect</h2>
            <p className="mt-2">
              Account details (name, email, phone), booking and vehicle information, payment details (processed by
              Stripe — we don&rsquo;t store card numbers), and identity verification documents for rentals.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">How we use it</h2>
            <p className="mt-2">
              To provide valet and rental services, process payments, send booking notifications (email/SMS), and
              respond to support requests.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">Third parties</h2>
            <p className="mt-2">
              We use Stripe for payments, Supabase for data storage, and may use Twilio, Resend, and Firebase for
              notifications. Each processes data under their own privacy policies.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">Your rights</h2>
            <p className="mt-2">
              You can view and update your account details at any time, or contact us to request deletion of your
              data, subject to legal retention requirements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
