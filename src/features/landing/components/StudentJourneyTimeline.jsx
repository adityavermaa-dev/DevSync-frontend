/* eslint-disable no-unused-vars */
import React from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { motion } from 'framer-motion';
import { GraduationCap, Trophy, Code2, MonitorPlay, Briefcase, Rocket, Star } from 'lucide-react';

const TIMELINE = [
  { icon: GraduationCap, title: 'College Starts', desc: 'You want to build, but don\'t know who to build with.' },
  { icon: Trophy, title: 'First Hackathon', desc: 'Find a team on DevSync. Win your first prize.' },
  { icon: Code2, title: 'Side Projects', desc: 'Collaborate with peers across the country.' },
  { icon: MonitorPlay, title: 'Public Portfolio', desc: 'Every shipped project becomes a showcase.' },
  { icon: Briefcase, title: 'Internship', desc: 'Recruiters notice your active DevSync profile.' },
  { icon: Rocket, title: 'Startup', desc: 'Meet your co-founder through our matching.' },
  { icon: Star, title: 'Career', desc: 'Graduate with a network of top builders.' }
];

export const StudentJourneyTimeline = () => {
  return (
    <div className="w-full py-24 bg-[var(--surface-primary)] relative z-20 overflow-hidden" id="roadmap">
      <div className="max-w-7xl mx-auto px-6">
        <Stack spacing="lg" align="center" className="text-center mb-20">
          <Heading level={2} className="text-4xl md:text-5xl font-bold tracking-tight">How DevSync Grows With You</Heading>
          <Text variant="lead" className="text-[var(--text-secondary)] max-w-2xl">
            We're not just selling a feature. We're supporting your entire developer journey from day one to your first job.
          </Text>
        </Stack>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--surface-primary)] via-[var(--color-primary)]/50 to-[var(--surface-primary)] -translate-x-1/2"></div>

          <div className="flex flex-col gap-12">
            {TIMELINE.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 relative ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Content Box */}
                  <div className={`flex-1 w-full flex ${isEven ? 'md:justify-start' : 'md:justify-end'} pl-20 md:pl-0`}>
                    <div className={`w-full max-w-sm p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-sm text-left ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                      <Heading level={4} className="text-xl font-bold mb-2 text-[var(--color-primary)]">{item.title}</Heading>
                      <Text className="text-[var(--text-secondary)]">{item.desc}</Text>
                    </div>
                  </div>

                  {/* Icon on Line */}
                  <div className="absolute left-8 md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 border-[var(--surface-primary)] bg-[var(--surface-sunken)] shadow-md flex items-center justify-center z-10">
                    <Icon className="w-5 h-5 text-[var(--text-primary)]" />
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block flex-1"></div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
