/* eslint-disable no-unused-vars */
import React from 'react';
import { Stack, Heading, Text, Grid } from '@/design-system';
import { motion } from 'framer-motion';

const MiniDeveloperCard = () => (
  <div className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg p-4 text-left shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-sm">JD</div>
      <div>
        <div className="h-2 w-20 bg-[var(--text-primary)] rounded mb-2"></div>
        <div className="h-1.5 w-12 bg-[var(--text-muted)] rounded"></div>
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-14 bg-blue-500/10 border border-blue-500/20 rounded-full"></div>
      <div className="h-5 w-12 bg-green-500/10 border border-green-500/20 rounded-full"></div>
    </div>
  </div>
);

const MiniKanban = () => (
  <div className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg p-3 flex gap-3 overflow-hidden shadow-sm h-[106px]">
    <div className="flex-1 bg-[var(--surface-elevated)] rounded p-2 flex flex-col gap-2">
      <div className="h-2 w-10 bg-[var(--text-muted)] rounded mb-1"></div>
      <div className="h-8 w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded"></div>
      <div className="h-6 w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded"></div>
    </div>
    <div className="flex-1 bg-[var(--surface-elevated)] rounded p-2 flex flex-col gap-2">
      <div className="h-2 w-10 bg-[var(--color-primary)] rounded mb-1"></div>
      <div className="h-10 w-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 rounded"></div>
    </div>
  </div>
);

const MiniPortfolio = () => (
  <div className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-sm h-[106px] flex flex-col">
    <div className="flex-1 w-full bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded mb-3"></div>
    <div className="flex justify-between items-center">
      <div>
        <div className="h-2 w-16 bg-[var(--text-primary)] rounded mb-1"></div>
        <div className="h-1.5 w-10 bg-[var(--text-muted)] rounded"></div>
      </div>
      <div className="flex -space-x-1">
        <div className="w-5 h-5 rounded-full bg-[var(--border-subtle)] border border-[var(--surface-primary)]"></div>
        <div className="w-5 h-5 rounded-full bg-[var(--border-strong)] border border-[var(--surface-primary)]"></div>
      </div>
    </div>
  </div>
);

const STEPS = [
  { preview: <MiniDeveloperCard />, title: '1. Create your developer profile', desc: 'Connect your GitHub, define your tech stack, and set your availability to let others know you\'re ready to build.' },
  { preview: <MiniKanban />, title: '2. Find teammates or join a hackathon', desc: 'Browse the Discover Dashboard or let our matching algorithm find students with the exact skills you need.' },
  { preview: <MiniPortfolio />, title: '3. Build together and showcase your work', desc: 'Collaborate in a dedicated Team Workspace, then turn your finished projects into a lasting portfolio.' },
];

export const HowItWorks = () => {
  return (
    <div className="w-full py-24 bg-[var(--surface-primary)] relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <Stack spacing="lg" align="center" className="text-center mb-16">
          <Heading level={2} className="text-4xl md:text-5xl font-bold tracking-tight">How DevSync Works</Heading>
        </Stack>

        <Grid cols={1} className="md:grid-cols-3" gap="xl">
          {STEPS.map((step, i) => (
            <motion.div 
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col text-left p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
            >
              <div className="w-full mb-8 relative flex items-center justify-center p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)]">
                {step.preview}
              </div>
              <Heading level={3} className="text-xl font-bold mb-3">{step.title}</Heading>
              <Text className="text-[var(--text-secondary)]">{step.desc}</Text>
            </motion.div>
          ))}
        </Grid>
      </div>
    </div>
  );
};
