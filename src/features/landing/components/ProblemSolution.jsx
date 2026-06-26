/* eslint-disable no-unused-vars */
import React from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { motion } from 'framer-motion';

export const ProblemSolution = () => {
  return (
    <div className="w-full py-24 bg-[var(--surface-sunken)] relative z-20" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <Stack spacing="xl" align="center" className="text-center mb-16">
          <Heading level={2} className="text-4xl md:text-5xl font-bold">Why DevSync Exists</Heading>
          <Text variant="lead" className="text-[var(--text-secondary)] max-w-2xl">
            Building projects with others is supposed to be fun. But right now, it's a mess of fragmented tools.
          </Text>
        </Stack>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] opacity-50"
          >
            <Heading level={4} className="mb-6 text-red-400">The Problem (Too Many Apps)</Heading>
            <Stack spacing="md">
              <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded">Find team on Discord</div>
              <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded">Chat on WhatsApp</div>
              <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded">Find Hackathons on Devpost</div>
              <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded">Manage tasks on Trello</div>
            </Stack>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--surface-primary)] shadow-lg shadow-[var(--color-primary)]/10"
          >
            <Heading level={4} className="mb-6 text-[var(--color-primary)]">The DevSync Way (One Platform)</Heading>
            <Stack spacing="md" className="h-full justify-center">
              <div className="p-6 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 rounded-lg text-center font-bold text-xl">
                DevSync Operating System
              </div>
              <Text className="text-center text-[var(--text-secondary)]">
                Everything you need to find a team, build a project, and showcase your portfolio. All in one unified environment.
              </Text>
            </Stack>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
