import React, { useState } from 'react';
import { AuthLayout, OAuthButton } from '@/features/auth';
import { Stack, Button, Text } from '@/design-system';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authApi.login({ email, password });
      window.location.href = '/dashboard'; 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
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
    <AuthLayout title="Welcome back" subtitle="Log in to your account to continue building.">
      <Stack spacing="lg">
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

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
              required
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-[var(--color-primary)] hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-11 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
              required
            />
          </div>
          <Button type="submit" variant="primary" className="h-11 mt-2" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <Text className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Don't have an account? <Link to="/signup" className="text-[var(--color-primary)] font-medium hover:underline">Sign up</Link>
        </Text>
      </Stack>
    </AuthLayout>
  );
};
