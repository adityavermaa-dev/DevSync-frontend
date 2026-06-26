import React from 'react';
import { Stack, Heading, Button } from '@/design-system';
import { Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingNavbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Stack direction="row" align="center" spacing="sm">
          <Terminal className="w-6 h-6 text-[var(--color-primary)]" />
          <Heading level={4} className="text-xl tracking-tight hidden sm:block">DevSync</Heading>
        </Stack>

        <Stack direction="row" spacing="lg" className="hidden md:flex text-sm font-medium text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--color-primary)] transition-colors">Features</a>
          <a href="#hackathons" className="hover:text-[var(--color-primary)] transition-colors">Hackathons</a>
          <a href="#projects" className="hover:text-[var(--color-primary)] transition-colors">Projects</a>
          <a href="#about" className="hover:text-[var(--color-primary)] transition-colors">About</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)] transition-colors">GitHub</a>
        </Stack>

        <Stack direction="row" spacing="sm">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Join DevSync Beta</Button>
        </Stack>
      </div>
    </nav>
  );
};
