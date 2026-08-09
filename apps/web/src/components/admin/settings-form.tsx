'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PricingConfig } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';

const RENTAL_CLASSES = ['ECONOMY', 'STANDARD', 'SUV', 'PREMIUM', 'LUXURY', 'VAN'] as const;
const DELIVERY_METHODS = ['LOT', 'LAX', 'HOME'] as const;

interface BusinessInfo {
  legalName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
}

function dollars(cents: number) { return (cents / 100).toFixed(2); }
function toCents(v: string) { return Math.round((parseFloat(v) || 0) * 100); }

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (cents: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-medium-gray">
      {label}
      <div className="flex items-center gap-1 rounded-card border border-light-gray/30 px-3">
        <span className="text-medium-gray">$</span>
        <input value={dollars(value)} onChange={(e) => onChange(toCents(e.target.value))} className="h-11 w-full bg-transparent text-sm text-white focus:outline-none" />
      </div>
    </label>
  );
}

function PctField({ label, value, onChange }: { label: string; value: number; onChange: (pct: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-medium-gray">
      {label}
      <div className="flex items-center gap-1 rounded-card border border-light-gray/30 px-3">
        <input value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="h-11 w-full bg-transparent text-sm text-white focus:outline-none" />
        <span className="text-medium-gray">%</span>
      </div>
    </label>
  );
}

export function SettingsForm({ initialPricing, initialBusiness }: { initialPricing: PricingConfig; initialBusiness: BusinessInfo }) {
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingConfig>(initialPricing);
  const [business, setBusiness] = useState<BusinessInfo>(initialBusiness);
  const [saving, setSaving] = useState<'pricing' | 'business' | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save(key: 'pricing' | 'business', value: unknown) {
    setSaving(key);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? 'Save failed');
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {savedAt && <span className="text-xs text-medium-gray">Saved at {savedAt}</span>}

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Business info</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Legal name
            <input value={business.legalName} onChange={(e) => setBusiness((s) => ({ ...s, legalName: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Support email
            <input value={business.supportEmail} onChange={(e) => setBusiness((s) => ({ ...s, supportEmail: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Support phone
            <input value={business.supportPhone} onChange={(e) => setBusiness((s) => ({ ...s, supportPhone: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Address
            <input value={business.address} onChange={(e) => setBusiness((s) => ({ ...s, address: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
          </label>
        </div>
        <div><Button variant="secondary" className="h-10 px-4 text-sm" onClick={() => save('business', business)} disabled={saving === 'business'}>{saving === 'business' ? 'Saving…' : 'Save business info'}</Button></div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Valet pricing</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MoneyField label="Standard / day" value={pricing.valet.standardPerDayCents} onChange={(v) => setPricing((s) => ({ ...s, valet: { ...s.valet, standardPerDayCents: v } }))} />
          <MoneyField label="VIP Express / person" value={pricing.valet.vipExpressPerPersonCents} onChange={(v) => setPricing((s) => ({ ...s, valet: { ...s.valet, vipExpressPerPersonCents: v } }))} />
          <MoneyField label="VIP Elite / person" value={pricing.valet.vipElitePerPersonCents} onChange={(v) => setPricing((s) => ({ ...s, valet: { ...s.valet, vipElitePerPersonCents: v } }))} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Car care add-ons</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <MoneyField label="Hand wash" value={pricing.carCare.handWashCents} onChange={(v) => setPricing((s) => ({ ...s, carCare: { ...s.carCare, handWashCents: v } }))} />
          <MoneyField label="Full detail" value={pricing.carCare.fullDetailCents} onChange={(v) => setPricing((s) => ({ ...s, carCare: { ...s.carCare, fullDetailCents: v } }))} />
          <MoneyField label="EV charge" value={pricing.carCare.evChargeCents} onChange={(v) => setPricing((s) => ({ ...s, carCare: { ...s.carCare, evChargeCents: v } }))} />
          <MoneyField label="Gas fill-up" value={pricing.carCare.gasFillUpCents ?? 0} onChange={(v) => setPricing((s) => ({ ...s, carCare: { ...s.carCare, gasFillUpCents: v } }))} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Cross-airport</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MoneyField label="Burbank" value={pricing.crossAirport.burbankCents} onChange={(v) => setPricing((s) => ({ ...s, crossAirport: { ...s.crossAirport, burbankCents: v } }))} />
          <MoneyField label="John Wayne" value={pricing.crossAirport.johnWayneCents} onChange={(v) => setPricing((s) => ({ ...s, crossAirport: { ...s.crossAirport, johnWayneCents: v } }))} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Rental class daily rates</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {RENTAL_CLASSES.map((c) => (
            <MoneyField key={c} label={c} value={pricing.rental.classDailyRateCents[c]} onChange={(v) => setPricing((s) => ({ ...s, rental: { ...s.rental, classDailyRateCents: { ...s.rental.classDailyRateCents, [c]: v } } }))} />
          ))}
        </div>
        <h3 className="mt-2 text-sm font-medium text-white">Delivery fees</h3>
        <div className="grid grid-cols-3 gap-3">
          {DELIVERY_METHODS.map((m) => (
            <MoneyField key={m} label={m} value={pricing.rental.deliveryCents[m]} onChange={(v) => setPricing((s) => ({ ...s, rental: { ...s.rental, deliveryCents: { ...s.rental.deliveryCents, [m]: v } } }))} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <PctField label="Weekly discount" value={pricing.rental.weeklyDiscountPct} onChange={(v) => setPricing((s) => ({ ...s, rental: { ...s.rental, weeklyDiscountPct: v } }))} />
          <PctField label="Monthly discount" value={pricing.rental.monthlyDiscountPct} onChange={(v) => setPricing((s) => ({ ...s, rental: { ...s.rental, monthlyDiscountPct: v } }))} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Rental insurance plans</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MoneyField label="Basic / day" value={pricing.rentalInsurance.basicPerDayCents} onChange={(v) => setPricing((s) => ({ ...s, rentalInsurance: { ...s.rentalInsurance, basicPerDayCents: v } }))} />
          <MoneyField label="Standard / day" value={pricing.rentalInsurance.standardPerDayCents} onChange={(v) => setPricing((s) => ({ ...s, rentalInsurance: { ...s.rentalInsurance, standardPerDayCents: v } }))} />
          <MoneyField label="Premium / day" value={pricing.rentalInsurance.premiumPerDayCents} onChange={(v) => setPricing((s) => ({ ...s, rentalInsurance: { ...s.rentalInsurance, premiumPerDayCents: v } }))} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-white">Tax, fees &amp; deposit</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <PctField label="Tax" value={pricing.taxPct} onChange={(v) => setPricing((s) => ({ ...s, taxPct: v }))} />
          <PctField label="Service fee" value={pricing.serviceFeePct} onChange={(v) => setPricing((s) => ({ ...s, serviceFeePct: v }))} />
          <MoneyField label="Deposit min" value={pricing.securityDepositCents.min} onChange={(v) => setPricing((s) => ({ ...s, securityDepositCents: { ...s.securityDepositCents, min: v } }))} />
          <MoneyField label="Deposit max" value={pricing.securityDepositCents.max} onChange={(v) => setPricing((s) => ({ ...s, securityDepositCents: { ...s.securityDepositCents, max: v } }))} />
        </div>
        <div><Button variant="primary" className="h-10 px-4 text-sm" onClick={() => save('pricing', pricing)} disabled={saving === 'pricing'}>{saving === 'pricing' ? 'Saving…' : 'Save all pricing'}</Button></div>
      </Card>
    </div>
  );
}
