import React, { useState } from 'react';
import { AuthLayout, OAuthButton } from '@/features/auth';
import { Stack, Button, Text, Heading } from '@/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Check } from 'lucide-react';

const ProgressIndicator = () => (
  <div className="relative flex w-full justify-between items-start mb-10 mt-2">
    {/* Background connecting line */}
    <div className="absolute top-[6px] left-[16%] right-[16%] h-[2px] bg-[var(--border-subtle)] z-0"></div>

    {/* Step 1 */}
    <div className="flex flex-col items-center relative z-10 w-1/3">
      <div className="w-3.5 h-3.5 rounded-full bg-[var(--color-primary)] ring-[6px] ring-[var(--surface-primary)] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
      <span className="mt-4 text-xs font-bold text-[var(--color-primary)] whitespace-nowrap">Create Account</span>
    </div>

    {/* Step 2 */}
    <div className="flex flex-col items-center relative z-10 w-1/3">
      <div className="w-3 h-3 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--border-strong)] ring-[6px] ring-[var(--surface-primary)] mt-[1px]"></div>
      <span className="mt-4 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap opacity-60">Profile</span>
    </div>

    {/* Step 3 */}
    <div className="flex flex-col items-center relative z-10 w-1/3">
      <div className="w-3 h-3 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--border-strong)] ring-[6px] ring-[var(--surface-primary)] mt-[1px]"></div>
      <span className="mt-4 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap opacity-60">GitHub</span>
    </div>
  </div>
);

const BetaSidePanel = () => (
  <div className="flex flex-col items-start text-left bg-[var(--surface-primary)] p-8 rounded-2xl border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[var(--color-primary)] to-purple-500"></div>
    <div className="text-4xl mb-6">🚀</div>
    <Heading level={2} className="text-3xl font-bold mb-4">Become a Founding Member</Heading>
    <Text className="text-[var(--text-secondary)] text-lg mb-8">
      You're joining the first 100 student developers building the future together.
    </Text>
    
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-500" />
        </div>
        <span className="font-medium text-[var(--text-primary)]">Early access to all features</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-500" />
        </div>
        <span className="font-medium text-[var(--text-primary)]">Direct feedback loop with founders</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-500" />
        </div>
        <span className="font-medium text-[var(--text-primary)]">Lifetime Founding Member badge</span>
      </div>
    </div>
  </div>
);

export const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authApi.signup(formData);
      // Directly route to onboarding since we're in beta
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setOauthLoading(true);
    setLoadingText('Connecting your GitHub...');
    try {
      await authApi.github();
    } catch {
      setError('GitHub login failed');
      setOauthLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome to DevSync" 
      subtitle="Let's build your developer profile."
      sidePanelContent={<BetaSidePanel />}
    >
      <Stack spacing="lg" className="mt-8">
        <ProgressIndicator />
        
        <OAuthButton 
          provider="github" 
          onClick={handleGithubLogin} 
          isLoading={oauthLoading} 
          loadingText={loadingText} 
        />
        
        <div className="flex items-center space-x-4 py-2">
          <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
          <Text variant="small" className="text-[var(--text-muted)] font-medium">OR</Text>
          <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium">First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
              required
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" variant="primary" className="h-11 mt-2" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Beta Account'}
          </Button>
        </form>

        <Text className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">Log in</Link>
        </Text>
      </Stack>
    </AuthLayout>
  );
};
