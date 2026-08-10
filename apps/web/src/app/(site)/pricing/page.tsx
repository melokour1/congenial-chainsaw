import { getPricingConfig } from '@/lib/pricing-config';
import { formatCents } from '@laxvaletcare/shared';
import { Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

const RENTAL_CLASS_LABEL: Record<string, string> = {
  ECONOMY: 'Economy', STANDARD: 'Standard', SUV: 'SUV', PREMIUM: 'Premium', LUXURY: 'Luxury', VAN: 'Van',
};

const DELIVERY_LABEL: Record<string, string> = {
  LOT: 'Pickup at our lot', LAX: 'Delivered to LAX', HOME: 'Delivered to your address',
};

export default async function PricingPage() {
  const pricing = await getPricingConfig();

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-bold">Pricing</h1>
        <p className="mt-2 text-medium-gray">Simple, upfront pricing — no surprise fees at the curb.</p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Airport valet</h2>
        <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
          <ul className="flex flex-col divide-y divide-light-gray/20 dark:divide-[#2A2A2A]">
            <Row label="Standard valet" value={`${formatCents(pricing.valet.standardPerDayCents)} / day`} />
            <Row label="VIP Express" value={`+${formatCents(pricing.valet.vipExpressPerPersonCents)} / person`} />
            <Row label="VIP Elite" value={`+${formatCents(pricing.valet.vipElitePerPersonCents)} / person`} />
          </ul>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Car care add-ons</h2>
        <p className="mt-1 text-sm text-medium-gray">Available to valet customers while your car is with us.</p>
        <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
          <ul className="flex flex-col divide-y divide-light-gray/20 dark:divide-[#2A2A2A]">
            <Row label="Hand wash" value={formatCents(pricing.carCare.handWashCents)} />
            <Row label="Full detail" value={formatCents(pricing.carCare.fullDetailCents)} />
            <Row label="EV charge" value={formatCents(pricing.carCare.evChargeCents)} />
            {pricing.carCare.gasFillUpCents != null && <Row label="Gas fill-up" value={formatCents(pricing.carCare.gasFillUpCents)} />}
          </ul>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Vehicle rentals</h2>
        <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
          <ul className="flex flex-col divide-y divide-light-gray/20 dark:divide-[#2A2A2A]">
            {Object.entries(pricing.rental.classDailyRateCents).map(([cls, cents]) => (
              <Row key={cls} label={RENTAL_CLASS_LABEL[cls] ?? cls} value={`${formatCents(cents)} / day`} />
            ))}
          </ul>
        </Card>
        <p className="mt-3 text-sm text-medium-gray">
          {pricing.rental.weeklyDiscountPct}% off rentals of 7+ days, {pricing.rental.monthlyDiscountPct}% off 30+ days.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Rental delivery</h2>
        <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
          <ul className="flex flex-col divide-y divide-light-gray/20 dark:divide-[#2A2A2A]">
            {Object.entries(pricing.rental.deliveryCents).map(([method, cents]) => (
              <Row key={method} label={DELIVERY_LABEL[method] ?? method} value={cents === 0 ? 'Free' : formatCents(cents)} />
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Rental protection plans</h2>
        <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
          <ul className="flex flex-col divide-y divide-light-gray/20 dark:divide-[#2A2A2A]">
            <Row label="Basic" value={`${formatCents(pricing.rentalInsurance.basicPerDayCents)} / day`} />
            <Row label="Standard" value={`${formatCents(pricing.rentalInsurance.standardPerDayCents)} / day`} />
            <Row label="Premium" value={`${formatCents(pricing.rentalInsurance.premiumPerDayCents)} / day`} />
          </ul>
        </Card>
      </section>

      <p className="mt-10 text-xs text-medium-gray">
        All prices subject to {pricing.taxPct}% tax and a {pricing.serviceFeePct}% service fee. Rentals require a
        refundable security deposit hold between {formatCents(pricing.securityDepositCents.min)} and{' '}
        {formatCents(pricing.securityDepositCents.max)}.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between py-3 text-sm">
      <span className="text-medium-gray">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  );
}
