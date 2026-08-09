const STEPS = [
  {
    number: '01',
    title: 'Book online in under 2 minutes',
    body: 'Tell us where you’re flying from, your dates, and your car. Get a firm price before you commit — no surprise fees at the curb.',
  },
  {
    number: '02',
    title: 'Drop your keys curbside',
    body: 'Pull up to departures, hand off your keys, and go. Your car is stored indoors and insured for the length of your trip.',
  },
  {
    number: '03',
    title: 'Text "on my way" and it’s ready',
    body: 'When you land, tell us your ETA. Your car is washed, charged if needed, and waiting curbside by the time you get there.',
  },
];

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
      {!compact && (
        <div className="mb-10 max-w-xl">
          <h2 className="font-display text-3xl font-bold">How it works</h2>
          <p className="mt-2 text-medium-gray">Three steps between you and a curbside car.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.number}>
            <span className="font-display text-sm font-bold text-medium-gray">{step.number}</span>
            <h3 className="mt-2 font-display text-lg font-bold">{step.title}</h3>
            <p className="mt-2 text-sm text-medium-gray">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
