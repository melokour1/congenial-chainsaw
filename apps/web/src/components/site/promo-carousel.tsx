import { Card } from '@/components/ui';

const PROMOS = [
  {
    code: 'FIRSTVALET',
    title: 'First valet free',
    body: 'New customers get their first airport valet trip on us. Applied automatically at checkout.',
  },
  {
    code: 'DETAIL',
    title: 'Detail while you fly',
    body: 'Add a Full Detail to any valet booking — your car comes back looking better than you left it.',
  },
  {
    code: 'REFER20',
    title: 'Refer a friend',
    body: 'Share your code. When a friend books their first trip, you both get $20 off.',
  },
];

export function PromoCarousel() {
  return (
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-xl">
        <h2 className="font-display text-3xl font-bold">Offers</h2>
        <p className="mt-2 text-medium-gray">A few ways to save on your next trip.</p>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {PROMOS.map((promo) => (
          <Card key={promo.code} className="min-w-[260px] max-w-[300px] shrink-0 snap-start border border-light-gray dark:border-[#2A2A2A]">
            <span className="text-xs font-semibold uppercase tracking-wide text-gold">{promo.code}</span>
            <h3 className="mt-2 font-display text-lg font-bold">{promo.title}</h3>
            <p className="mt-2 text-sm text-medium-gray">{promo.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
