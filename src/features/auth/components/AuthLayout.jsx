import React from 'react';
import { Stack, Heading, Text } from '@/design-system';
import { Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle, sidePanelContent }) => {
  return (
    <div className="min-h-screen w-full flex bg-[var(--surface-primary)]">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center space-x-2 mb-12">
            <Terminal className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-xl font-bold tracking-tight">DevSync</span>
          </Link>

          <Stack spacing="sm" className="mb-8">
            <Heading level={1} className="text-3xl font-bold tracking-tight">{title}</Heading>
            {subtitle && <Text className="text-[var(--text-secondary)]">{subtitle}</Text>}
          </Stack>

          {children}
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-[var(--surface-sunken)] border-l border-[var(--border-subtle)] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 w-full max-w-lg">
          {sidePanelContent || (
            <div className="text-center">
              <Heading level={2} className="text-4xl font-bold mb-4">Build together.</Heading>
              <Text variant="lead" className="text-[var(--text-secondary)]">Join the exclusive network of student developers shipping real projects and winning hackathons.</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
