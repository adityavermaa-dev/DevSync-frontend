/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Heading, Text, Button } from '@/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLES_DATA = [
  { id: 'frontend', label: 'Frontend', name: 'Alex Rivera', role: 'Frontend Developer', emoji: '🎨', skills: ['React', 'Next.js', 'Tailwind'], fit: '92%' },
  { id: 'backend', label: 'Backend', name: 'Aditi Verma', role: 'Backend Developer', emoji: '👩‍💻', skills: ['Node.js', 'MongoDB', 'Redis'], fit: '96%' },
  { id: 'ai', label: 'AI', name: 'David Chen', role: 'AI Engineer', emoji: '🤖', skills: ['Python', 'PyTorch', 'TensorFlow'], fit: '98%' },
  { id: 'designer', label: 'Designer', name: 'Sarah Miller', role: 'UI/UX Designer', emoji: '✨', skills: ['Figma', 'Prototyping', 'Framer'], fit: '90%' }
];

export const HeroSection = () => {
  const [roleIndex, setRoleIndex] = useState(1);
  const navigate = useNavigate();

  const selectedRole = ROLES_DATA[roleIndex];

  return (
    <div className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center space-y-8 py-20 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heading level={1} className="text-5xl sm:text-6xl tracking-tighter leading-[1.1] font-bold">
              Find teammates.<br/>
              Build products.<br/>
              <span className="text-[var(--color-primary)]">Grow your career.</span>
            </Heading>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Text variant="lead" className="text-[var(--text-secondary)] text-xl max-w-lg">
              DevSync helps students discover teammates, collaborate in shared workspaces, and turn every project into a portfolio.
            </Text>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col space-y-4 max-w-md"
          >
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50 backdrop-blur-md">
              <Text variant="small" className="text-[var(--text-muted)] mb-3 uppercase tracking-wider font-semibold">I'm looking for a...</Text>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {ROLES_DATA.map((r, i) => {
                  const isSelected = i === roleIndex;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRoleIndex(i)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        isSelected 
                          ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                          : 'bg-[var(--surface-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span className="text-sm">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col space-y-3 mb-2 text-sm font-medium text-[var(--text-secondary)]">
                <div className="flex items-center"><span className="mr-3 text-base">🟢</span> Active Teams</div>
                <div className="flex items-center"><span className="mr-3 text-base">🚀</span> Upcoming Hackathons</div>
                <div className="flex items-center"><span className="mr-3 text-base">💬</span> Students Looking For Teammates</div>
              </div>

              <Button variant="primary" className="w-full mt-6 h-12 text-base shadow-[0_4px_20px_rgba(168,85,247,0.3)]" onClick={() => navigate('/signup')}>
                Find My Team <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="hidden lg:flex items-center justify-center relative w-full h-full pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedRole.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm mt-10"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-3xl blur-md opacity-20 animate-pulse"></div>
              <div className="relative bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                  <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                    Developer Matched
                  </span>
                  <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-bold px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    {selectedRole.fit} Fit
                  </span>
                </div>
                
                <div className="flex items-center gap-4 py-2">
                  <div className="w-14 h-14 rounded-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl shadow-inner">
                    {selectedRole.emoji}
                  </div>
                  <div>
                    <Heading level={4} className="text-lg mb-0.5">{selectedRole.name}</Heading>
                    <Text className="text-[var(--text-secondary)] text-sm">{selectedRole.role}</Text>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRole.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="w-full mt-4 h-11 rounded-lg bg-white text-black font-semibold flex items-center justify-center shadow-md transition-transform hover:scale-105">
                  Invite to Project
                </div>
              </div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-lg">⚡</div>
                <div className="pr-2">
                  <div className="text-sm font-bold">Hackathon Team</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Looking for {selectedRole.label}</div>
                </div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] text-lg">🚀</div>
                <div className="pr-2">
                  <div className="text-sm font-bold">New Startup Idea</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Needs {selectedRole.role}</div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
