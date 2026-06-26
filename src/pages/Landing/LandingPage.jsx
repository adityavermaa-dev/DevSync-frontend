import React from 'react';
import { Page } from '@/design-system';
import { 
  LandingNavbar, 
  HeroSection, 
  HeroNetworkAnimation, 
  WhyWeBuiltIt,
  InteractiveRecommendation,
  HowItWorks, 
  ProductDemoSection,
  BuiltForStudents,
  StudentJourneyTimeline,
  SocialProof, 
  WaitlistSection, 
  LandingFooter
} from '@/features/landing';

export const LandingPage = () => {
  return (
    <Page className="bg-[var(--surface-primary)]">
      <HeroNetworkAnimation />
      <LandingNavbar />
      <HeroSection />
      <WhyWeBuiltIt />
      <StudentJourneyTimeline />
      <InteractiveRecommendation />
      <HowItWorks />
      <ProductDemoSection />
      <BuiltForStudents />
      <SocialProof />
      <WaitlistSection />
      <LandingFooter />
    </Page>
  );
};
