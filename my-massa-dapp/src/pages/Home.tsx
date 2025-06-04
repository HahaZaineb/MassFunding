'use client';

import HeroSection from '@/components/landing-page/HeroSection';
import FeaturesSection from '@/components/landing-page/FeaturesSection';
import FeaturedProjectsSection from '@/components/landing-page/FeaturedProjectsSection';
import FAQSection from '@/components/landing-page/FAQ';
import CTASection from '@/components/landing-page/CTASection';

export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FeaturedProjectsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
