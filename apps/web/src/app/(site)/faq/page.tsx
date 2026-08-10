import { Card } from '@/components/ui';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Which terminals do you serve?',
    a: 'All LAX terminals (1–8 and TBIT/Terminal B), plus off-site pickup for JSX LAX and Atlantic Aviation. Terminal 5 is closed until 2028.',
  },
  {
    q: 'Where is my car stored while I’m gone?',
    a: 'Indoors, at our secured lot near LAX, and insured for the full length of your trip.',
  },
  {
    q: 'How do I get my car back when I land?',
    a: 'Text or tap "on my way" in your account once you land. Your car is washed, charged if needed, and waiting curbside by the time you get to arrivals.',
  },
  {
    q: 'Do you charge extra fees I don’t see upfront?',
    a: 'No — the price you’re quoted at booking is the price you pay, plus tax and the service fee shown before you confirm. No surprise curbside charges.',
  },
  {
    q: 'Can I rent a car instead of leaving mine?',
    a: 'Yes — we run a small fleet (Economy through Luxury and Van) with pickup at our lot, or delivery to LAX or your address. See Pricing for rates.',
  },
  {
    q: 'What car care add-ons are available?',
    a: 'Hand wash, full detail, and EV charging for valet customers while your car is in our care.',
  },
  {
    q: 'What if my flight is delayed or my return date changes?',
    a: 'Update your return date any time from your account, or message us — no fee for adjusting dates.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-bold">Frequently asked questions</h1>
        <p className="mt-2 text-medium-gray">Can&rsquo;t find what you&rsquo;re looking for? Ask LAXValetCare from your account.</p>
      </div>
      <div className="mt-10 flex max-w-2xl flex-col gap-4">
        {FAQS.map((item) => (
          <Card key={item.q} className="border border-light-gray dark:border-[#2A2A2A]">
            <h2 className="font-display text-base font-bold">{item.q}</h2>
            <p className="mt-2 text-sm text-medium-gray">{item.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
