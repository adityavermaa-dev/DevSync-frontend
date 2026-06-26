/* eslint-disable no-unused-vars */
import React from 'react';
import { Stack, Heading, Text, Grid } from '@/design-system';
import { motion } from 'framer-motion';
import { Trophy, Code2, Briefcase } from 'lucide-react';

export const BuiltForStudents = () => {
  return (
    <div className="w-full py-24 bg-[var(--surface-sunken)] relative z-20 border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-6">
        <Stack spacing="lg" align="center" className="text-center mb-16">
          <Heading level={2} className="text-4xl md:text-5xl font-bold tracking-tight">Built for Students</Heading>
          <Text variant="lead" className="text-[var(--text-secondary)] max-w-2xl">
            You're not on LinkedIn. You're not on GitHub. You're building the future, and you need an OS designed for your journey.
          </Text>
        </Stack>

        <Grid cols={1} className="md:grid-cols-3" gap="xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-3">Win More Hackathons</Heading>
            <Text className="text-[var(--text-secondary)]">
              Find the perfect teammates. Don't leave your hackathon success up to random team assignments.
            </Text>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6 text-blue-500" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-3">Build Projects</Heading>
            <Text className="text-[var(--text-secondary)]">
              Ship together. Learn from each other. Build software that solves real problems, not just tutorial clones.
            </Text>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6 text-green-500" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-3">Stand Out to Recruiters</Heading>
            <Text className="text-[var(--text-secondary)]">
              Showcase real work. When recruiters see how you collaborate in DevSync, you stand out instantly.
            </Text>
          </motion.div>
        </Grid>
      </div>
    </div>
  );
};
