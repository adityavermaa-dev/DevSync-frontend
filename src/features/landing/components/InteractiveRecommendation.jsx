/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const ROLES = [
  {
    id: 'frontend',
    label: 'Frontend Developer',
    recommendation: 'React Developers & UI Designers',
    perk: 'Build beautiful interfaces together.'
  },
  {
    id: 'backend',
    label: 'Backend Developer',
    recommendation: 'Frontend Devs & Mobile Engineers',
    perk: 'Provide the robust APIs they need.'
  },
  {
    id: 'ai',
    label: 'AI Engineer',
    recommendation: 'Full Stack Devs',
    perk: 'Integrate your models into real products.'
  },
  {
    id: 'ui',
    label: 'UI/UX Designer',
    recommendation: 'Frontend Developers',
    perk: 'Bring your Figma designs to life.'
  }
];

export const InteractiveRecommendation = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  return (
    <div className="w-full py-24 bg-[var(--surface-primary)] relative z-20" id="recommendation">
      <div className="max-w-4xl mx-auto px-6">
        <Stack spacing="xl" align="center" className="text-center mb-16">
          <Heading level={2} className="text-3xl md:text-4xl font-bold tracking-tight">Who are you looking for?</Heading>
          <Text variant="lead" className="text-[var(--text-secondary)]">
            Tell us your role, and we'll show you who you should team up with.
          </Text>
        </Stack>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Selection */}
          <div className="flex flex-col space-y-3">
            <Text className="text-[var(--text-muted)] font-medium mb-2 uppercase tracking-wider text-sm">I am a...</Text>
            {ROLES.map((role) => {
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                      : 'border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {role.label}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                      </motion.div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side: Recommendation */}
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-xl text-center min-h-[300px]">
            <Text className="text-[var(--text-secondary)] mb-6">We recommend teaming up with...</Text>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <Heading level={3} className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                  {selectedRole.recommendation}
                </Heading>
                <Text className="text-[var(--text-secondary)]">
                  {selectedRole.perk}
                </Text>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};
