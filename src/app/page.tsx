import { HowItWorks } from '@/components/how-it-works';
import { LandingHero } from '@/components/landing-hero';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <LandingHero />
      <HowItWorks />
    </div>
  );
}
