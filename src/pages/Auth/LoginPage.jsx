import React, { useState, useEffect } from 'react';
import { AuthLayout, OAuthButton } from '@/features/auth';
import { Stack, Button, Text } from '@/design-system';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '@/redux/userSlice';
import { BASE_URL } from '@/constants/commonData';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(store => store.user);

  useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const isEmailVerificationRequiredMessage = (value) => {
    const text = String(value || '').toLowerCase();
    return text.includes('verify') && text.includes('email');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post(BASE_URL + "/login", { email: email.trim(), password }, { withCredentials: true });
      const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
      dispatch(addUser(profileRes.data));
      toast.success('Welcome back!');
      navigate("/feed");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || (err?.response?.status === 401 ? "Invalid email or password" : "Something went wrong.");
      const errorMsg = typeof msg === "string" ? msg : "Something went wrong.";

      if (isEmailVerificationRequiredMessage(errorMsg)) {
        toast.error(errorMsg);
        navigate('/signup-success', { state: { email: email.trim() } });
        return;
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setOauthLoading(true);
      setLoadingText('Connecting Google...');
      await axios.post(BASE_URL + "/auth/google/callback", { credential: credentialResponse.credential }, { withCredentials: true });
      const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
      dispatch(addUser(profileRes.data));
      toast.success('Welcome back!');
      navigate("/feed");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Google login failed.";
      const errorMsg = typeof msg === "string" ? msg : "Google login failed.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleGithubLogin = () => {
    setOauthLoading(true);
    setLoadingText('Connecting GitHub...');
    setError("");
    window.location.href = `${BASE_URL}/auth/github`;
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your account to continue building.">
      <Stack spacing="lg">
        <OAuthButton 
          provider="github" 
          onClick={handleGithubLogin} 
          isLoading={oauthLoading && loadingText.includes('GitHub')} 
          loadingText={loadingText} 
        />
        
        <div className="w-full">
          <GoogleLogin 
            onSuccess={handleGoogleLogin} 
            onError={() => {
              setError("Google login failed");
              toast.error("Google login failed");
            }}
            size="large"
            width="100%"
            shape="rectangular"
            text="continue_with"
            theme="outline"
          />
        </div>

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
