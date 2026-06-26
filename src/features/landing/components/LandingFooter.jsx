import React from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { Terminal } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="w-full py-12 bg-[var(--surface-primary)] border-t border-[var(--border-subtle)] relative z-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Stack direction="row" align="center" spacing="sm" className="mb-4">
            <Terminal className="w-6 h-6 text-[var(--color-primary)]" />
            <Heading level={4} className="text-xl tracking-tight">DevSync</Heading>
          </Stack>
          <Text variant="small" className="text-[var(--text-muted)]">
            The operating system for student developers.
          </Text>
        </div>
        
        <div>
          <Heading level={5} className="font-semibold mb-4 text-[var(--text-secondary)] uppercase tracking-wider text-sm">Product</Heading>
          <Stack spacing="sm">
            <a href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Features</a>
            <a href="#hackathons" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Hackathons</a>
            <a href="#projects" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Projects</a>
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Roadmap</a>
          </Stack>
        </div>

        <div>
          <Heading level={5} className="font-semibold mb-4 text-[var(--text-secondary)] uppercase tracking-wider text-sm">Developers</Heading>
          <Stack spacing="sm">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Open Source (GitHub)</a>
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Changelog</a>
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Status</a>
          </Stack>
        </div>

        <div>
          <Heading level={5} className="font-semibold mb-4 text-[var(--text-secondary)] uppercase tracking-wider text-sm">Legal</Heading>
          <Stack spacing="sm">
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Terms of Service</a>
          </Stack>
        </div>
      </div>
    </footer>
  );
};
