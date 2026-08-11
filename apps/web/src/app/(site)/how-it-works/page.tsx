import Link from 'next/link';
import { HowItWorks } from '@/components/site/how-it-works';
import { Button } from '@/components/ui';

export default function HowItWorksPage() {
  return (
    <div>
      <div className="mx-auto max-w-content px-4 pt-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold">How it works</h1>
        <p className="mt-2 max-w-xl text-medium-gray">
          Airport valet at LAX, reinvented — here&rsquo;s exactly what happens from booking to pickup.
        </p>
      </div>
      <HowItWorks compact />
      <div className="mx-auto max-w-content px-4 pb-16 sm:px-6">
        <Link href="/book/valet">
          <Button variant="primary" className="h-12 px-8">Book valet now</Button>
        </Link>
      </div>
    </div>
  );
}
