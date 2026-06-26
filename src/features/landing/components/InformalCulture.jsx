import React from 'react';
import { motion } from 'framer-motion';
import { Container, Heading, Text } from '@/design-system';
import { MessageSquare, Coffee, Rocket } from 'lucide-react';

export const InformalCulture = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--surface-primary)]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[30rem] h-[30rem] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--color-primary)]"
            >
              <Coffee className="w-4 h-4" />
              <span>Vibe Check Passed</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Heading level={2} className="text-4xl md:text-5xl font-extrabold mb-6">
                No Corporate Speak. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                  Just Build.
                </span>
              </Heading>
              
              <Text className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-6">
                Unlike other professional networks, you don't need a perfectly curated corporate persona here. 
                Be yourself, use emojis, share your messy code, and connect with developers who just want to ship cool stuff.
              </Text>
            </motion.div>

            <motion.ul 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {[
                "No 'thrilled and humbled to announce' posts",
                "Talk how you actually talk in Discord",
                "Focus on what you build, not your resume font"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Rocket className="w-3 h-3 text-green-500" />
                  </div>
                  <Text className="font-medium text-[var(--text-primary)]">{item}</Text>
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="w-full md:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                {/* LinkedIn Style */}
                <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">IN</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">Corporate Dev</span>
                      <span className="text-xs text-[var(--text-muted)]">1st</span>
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-none bg-[var(--surface-primary)] border border-[var(--border-subtle)]">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        I am absolutely thrilled and deeply humbled to announce that I have successfully resolved a syntax error in my React component. #GrowthMindset #Synergy
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent my-2" />

                {/* DevSync Style */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 mt-1">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">You</span>
                      <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded-full font-medium">Hacker</span>
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-none bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <p className="text-[15px] text-[var(--text-primary)] leading-relaxed">
                        bro my api finally works after 6 hours of crying 😭 who wants to connect the frontend??
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Absolute Badge */}
              <div className="absolute -right-4 -bottom-4 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm transform rotate-3">
                100% Real Vibe
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};
