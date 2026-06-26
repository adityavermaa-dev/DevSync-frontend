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

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const user = useSelector(store => store.user);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);
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
