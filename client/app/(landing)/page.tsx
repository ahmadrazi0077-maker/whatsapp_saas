import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { BlogSection } from '@/components/landing/BlogSection';
import { CTA } from '@/components/landing/CTA';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <BlogSection />
      <CTA />
    </>
  );
}