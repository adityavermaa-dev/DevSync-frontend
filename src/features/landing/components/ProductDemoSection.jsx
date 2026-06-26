/* eslint-disable no-unused-vars */
import React from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const MockDiscoverUI = () => (
  <div className="relative w-full aspect-[4/3] flex items-center justify-center p-4 md:p-8">
    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 to-transparent rounded-3xl"></div>
    <div className="relative w-full max-w-sm bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
        <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
          Recommended Match
        </span>
        <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold px-2.5 py-1 rounded-full border border-[var(--color-primary)]/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]">92% Compatibility</span>
      </div>
      
      <div className="flex items-center gap-4 py-2">
        <div className="w-16 h-16 rounded-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] flex items-center justify-center text-3xl">👨‍💻</div>
        <div>
          <Heading level={4} className="text-xl mb-0.5">Rahul Sharma</Heading>
          <Text className="text-[var(--text-secondary)] text-sm">Backend Developer</Text>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-1">
        <span className="px-3 py-1 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-full text-xs font-medium">Node.js</span>
        <span className="px-3 py-1 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-full text-xs font-medium">PostgreSQL</span>
        <span className="px-3 py-1 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-full text-xs font-medium">Docker</span>
      </div>
      
      <div className="flex gap-3 mt-4">
        <div className="flex-1 h-11 rounded-lg bg-[var(--color-primary)] text-white font-semibold flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20 cursor-pointer hover:bg-purple-600 transition-colors">
          Invite
        </div>
        <div className="flex-1 h-11 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold flex items-center justify-center hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer">
          Message
        </div>
      </div>
    </div>
  </div>
);

const MockHackathonUI = () => (
  <div className="relative w-full aspect-[4/3] flex items-center justify-center p-4 md:p-8">
    <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-3xl"></div>
    <div className="relative w-full max-w-sm bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      <div className="h-28 bg-[url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute top-4 left-4 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          Live
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-4">
        <div>
          <Heading level={4} className="text-xl mb-1">Global Web3 Hackathon</Heading>
          <Text className="text-[var(--text-secondary)] text-sm">Build the future of decentralized apps.</Text>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-subtle)] mt-2">
           <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full bg-[var(--surface-sunken)] border-2 border-[var(--surface-primary)] flex items-center justify-center text-sm z-30">👩‍💻</div>
               <div className="w-8 h-8 rounded-full bg-[var(--surface-sunken)] border-2 border-[var(--surface-primary)] flex items-center justify-center text-sm z-20">🧑‍💻</div>
               <div className="w-8 h-8 rounded-full bg-[var(--surface-sunken)] border-2 border-[var(--surface-primary)] flex items-center justify-center text-sm z-10">👨‍🎨</div>
             </div>
             <span className="text-sm font-medium ml-1">4/5 Members</span>
           </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] font-medium">Need</span>
            <span className="text-sm font-bold text-[var(--color-primary)]">UI Designer</span>
          </div>
          <div className="px-5 h-10 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold flex items-center justify-center shadow-sm cursor-pointer hover:bg-[var(--surface-sunken)] transition-colors">
            Apply
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MockWorkspaceUI = () => (
  <div className="relative w-full aspect-[4/3] flex items-center justify-center p-4 md:p-8">
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-3xl"></div>
    <div className="relative w-full h-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div className="h-14 border-b border-[var(--border-subtle)] flex items-center px-4 bg-[var(--surface-sunken)] gap-6">
        <div className="font-bold">Project Alpha</div>
        <div className="text-sm font-medium text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] h-full flex items-center">Kanban</div>
        <div className="text-sm font-medium text-[var(--text-muted)]">Chat</div>
        <div className="text-sm font-medium text-[var(--text-muted)]">GitHub</div>
      </div>
      
      <div className="flex-1 p-5 flex gap-4 overflow-hidden bg-[var(--surface-primary)]">
        {/* To Do Column */}
        <div className="flex-1 flex flex-col gap-3 min-w-[200px]">
          <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex justify-between">
            To Do <span className="bg-[var(--surface-sunken)] px-1.5 rounded text-[var(--text-muted)]">2</span>
          </div>
          <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer">
            <div className="flex gap-2 mb-2">
               <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">Frontend</span>
            </div>
            <p className="text-sm font-medium leading-tight mb-3">Implement Auth UI</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">Oct 24</span>
              <div className="w-5 h-5 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center text-[10px]">👩‍💻</div>
            </div>
          </div>
          <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer">
            <div className="flex gap-2 mb-2">
               <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold px-2 py-0.5 rounded">Design</span>
            </div>
            <p className="text-sm font-medium leading-tight mb-3">Create logo & branding</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)]">Oct 26</span>
              <div className="w-5 h-5 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center text-[10px]">👨‍🎨</div>
            </div>
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex-1 flex flex-col gap-3 min-w-[200px]">
          <div className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider flex justify-between">
            In Progress <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 rounded">1</span>
          </div>
          <div className="bg-[var(--surface-elevated)] border-2 border-[var(--color-primary)] rounded-xl p-3 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 bg-[var(--color-primary)] text-white rounded-bl-lg">
                <Check className="w-3 h-3" />
            </div>
            <div className="flex gap-2 mb-2 mt-1">
               <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded">Backend</span>
            </div>
            <p className="text-sm font-medium leading-tight mb-3">Setup Express API</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--color-primary)] font-semibold">Working</span>
              <div className="w-5 h-5 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center text-[10px]">🧑‍💻</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ProductDemoSection = () => {
  return (
    <div className="w-full py-32 bg-[var(--surface-primary)] relative z-20 border-t border-[var(--border-subtle)]" id="features">
      <div className="max-w-6xl mx-auto px-6">
        {/* We reduced the centered header usage by making the first split feature prominent */}

        <div className="flex flex-col gap-32">
          
          {/* Feature 1 - Left UI, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 order-2 md:order-1">
              <MockDiscoverUI />
            </div>
            <div className="flex-1 order-1 md:order-2">
              <Text className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                Discover
              </Text>
              <Heading level={2} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Find developers that match your skills.</Heading>
              <Text className="text-[var(--text-secondary)] text-lg mb-6">
                Stop posting in random Discord channels. DevSync's Discover dashboard lets you filter students by tech stack, college, and availability to find the perfect co-founder or teammate.
              </Text>
              <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-primary)]"/> Skill matching</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-primary)]"/> Availability sync</div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Left Text, Right UI */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1">
              <Text className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                Hackathon Hub
              </Text>
              <Heading level={2} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Join teams already looking for you.</Heading>
              <Text className="text-[var(--text-secondary)] text-lg mb-6">
                Browse upcoming hackathons and instantly see which teams are missing a frontend dev or a designer. Apply with one click using your DevSync profile.
              </Text>
              <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-primary)]"/> Instant apply</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-primary)]"/> Live hackathons</div>
              </div>
            </div>
            <div className="flex-1">
              <MockHackathonUI />
            </div>
          </div>

          {/* Feature 3 - Left UI, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 order-2 md:order-1">
              <MockWorkspaceUI />
            </div>
            <div className="flex-1 order-1 md:order-2">
              <Text className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                Project Workspace
              </Text>
              <Heading level={2} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Chat, Kanban, GitHub, all in one place.</Heading>
              <Text className="text-[var(--text-secondary)] text-lg mb-6">
                Once your team is formed, you get a dedicated workspace. No more switching between Trello and WhatsApp. Manage your entire build process in one unified environment.
              </Text>
              <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-primary)]"/> Real-time sync</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-primary)]"/> GitHub integration</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
