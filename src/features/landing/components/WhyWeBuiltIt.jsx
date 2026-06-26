import React from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Code, Kanban, ArrowRight, ArrowDown, Terminal } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export const WhyWeBuiltIt = () => {
  return (
    <div className="w-full py-32 bg-[var(--surface-sunken)] relative z-20 border-t border-[var(--border-subtle)]" id="about">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="flex-1">
            <Text className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
               The Problem
            </Text>
            <Heading level={2} className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Building together shouldn't be this hard.</Heading>
            <Text variant="lead" className="text-[var(--text-secondary)] text-lg mb-8">
              Finding a team and shipping a project shouldn't require juggling five different apps. DevSync unifies your entire workflow.
            </Text>
            <ul className="space-y-4 text-[var(--text-secondary)]">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✖</span>
                <span>Scattered conversations across Discord and WhatsApp.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✖</span>
                <span>Losing track of tasks in a forgotten Trello board.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5">✔</span>
                <span className="text-[var(--text-primary)] font-medium">One unified workspace for everything.</span>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full relative">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center flex-1 max-w-[180px]"
              >
                <Text className="text-[var(--text-muted)] font-medium mb-4 uppercase tracking-wider text-xs">5 Disconnected Tools</Text>
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] opacity-70">
                    <MessageSquare className="w-5 h-5 text-[#5865F2]" />
                    <span className="font-medium text-sm">Discord</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] opacity-70">
                    <Phone className="w-5 h-5 text-[#25D366]" />
                    <span className="font-medium text-sm">WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] opacity-70">
                    <GithubIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    <span className="font-medium text-sm">GitHub</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] opacity-70">
                    <Kanban className="w-5 h-5 text-[#0052CC]" />
                    <span className="font-medium text-sm">Trello</span>
                  </div>
                </div>
              </motion.div>

              <ArrowRight className="hidden sm:block w-8 h-8 text-[var(--text-muted)] flex-shrink-0" />
              <ArrowDown className="block sm:hidden w-8 h-8 text-[var(--text-muted)] flex-shrink-0" />

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center flex-1 max-w-[240px]"
              >
                <Text className="text-[var(--color-primary)] font-medium mb-4 uppercase tracking-wider text-xs">1 Unified Workspace</Text>
                
                <div className="w-full p-6 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--surface-elevated)] shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col items-center justify-center text-center aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent"></div>
                  
                  <Terminal className="w-12 h-12 text-[var(--color-primary)] mb-4 relative z-10" />
                  <Heading level={3} className="text-xl font-bold mb-2 relative z-10">DevSync</Heading>
                  <Text className="text-[var(--text-secondary)] text-xs relative z-10">
                    Discover teammates, plan tasks, chat, and deploy your project all from one place.
                  </Text>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
