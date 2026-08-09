import { HeroSearchCard } from '@/components/site/hero-search-card';
import { ServiceTabs } from '@/components/site/service-tabs';
import { HowItWorks } from '@/components/site/how-it-works';
import { TrustBadges } from '@/components/site/trust-badges';
import { PromoCarousel } from '@/components/site/promo-carousel';
import { PhotoPlaceholder } from '@/components/site/photo-placeholder';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <PhotoPlaceholder label="LAX Theme Building at dusk, valet handing off keys" className="h-full w-full" aspect="" bare />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        </div>
        <div className="relative mx-auto flex max-w-content flex-col items-start gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl">Valet, reinvented.</h1>
            <p className="mt-4 text-lg text-white/80">
              Airport valet at LAX and vehicle rentals — on your terms. Drop your keys curbside,
              track your car in real time, and pick it up ready to go.
            </p>
          </div>
          <HeroSearchCard />
        </div>
      </section>

      <ServiceTabs />
      <TrustBadges />
      <HowItWorks />
      <PromoCarousel />
    </>
  );
}
