export default function TermsPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 rounded-card border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          Placeholder text — not reviewed by an attorney. Replace this page with real terms (drafted or reviewed by
          counsel) before accepting real bookings, payments, or vehicle rentals.
        </p>

        <div className="mt-8 flex flex-col gap-6 text-sm text-medium-gray">
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">1. Services</h2>
            <p className="mt-2">
              LAXValetCare provides airport valet parking, vehicle rentals, and related car care add-ons at Los
              Angeles International Airport (LAX). By booking, you agree to these terms.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">2. Bookings &amp; payment</h2>
            <p className="mt-2">
              Prices shown at booking include the quoted service, applicable tax, and service fee. Rentals require a
              refundable security deposit hold.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">3. Vehicle care &amp; liability</h2>
            <p className="mt-2">
              Vehicles left in our care are stored and insured for the duration of the booking, subject to policy
              terms to be defined. Customers are responsible for accurately describing their vehicle&rsquo;s condition
              at drop-off.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">4. Cancellations</h2>
            <p className="mt-2">Cancellation and refund policy to be defined.</p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-black dark:text-white">5. Contact</h2>
            <p className="mt-2">Questions about these terms — contact us through your account.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
