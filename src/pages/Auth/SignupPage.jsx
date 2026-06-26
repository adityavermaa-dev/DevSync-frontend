import React, { useState, useEffect } from 'react';
import { AuthLayout, OAuthButton } from '@/features/auth';
import { Stack, Button, Text, Heading } from '@/design-system';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '@/redux/userSlice';
import { BASE_URL } from '@/constants/commonData';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { Check } from 'lucide-react';

const ProgressIndicator = () => (
  <div className="relative flex w-full justify-between items-start mb-10 mt-2">
    <div className="absolute top-[6px] left-[16%] right-[16%] h-[2px] bg-[var(--border-subtle)] z-0"></div>
    <div className="flex flex-col items-center relative z-10 w-1/3">
      <div className="w-3.5 h-3.5 rounded-full bg-[var(--color-primary)] ring-[6px] ring-[var(--surface-primary)] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
      <span className="mt-4 text-xs font-bold text-[var(--color-primary)] whitespace-nowrap">Create Account</span>
    </div>
    <div className="flex flex-col items-center relative z-10 w-1/3">
      <div className="w-3 h-3 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--border-strong)] ring-[6px] ring-[var(--surface-primary)] mt-[1px]"></div>
      <span className="mt-4 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap opacity-60">Profile</span>
    </div>
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
  const dispatch = useDispatch();
  const user = useSelector(store => store.user);
  
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await axios.post(BASE_URL + "/signup", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      }, { withCredentials: true });
      
      toast.success("Account created successfully. Please check your email to verify your account.");
      navigate('/signup-success', { state: { email: formData.email.trim() } });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Failed to sign up";
      const errorMsg = typeof msg === "string" ? msg : "Failed to sign up";
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
      toast.success('Welcome!');
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Google signup failed.";
      const errorMsg = typeof msg === "string" ? msg : "Google signup failed.";
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

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${BASE_URL}/auth/github`,
      "devsync_github_auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      toast.error("Please allow popups for GitHub signup");
      setOauthLoading(false);
      return;
    }

    const messageListener = async (event) => {
      if (event.data === "devsync_github_auth_success") {
        window.removeEventListener("message", messageListener);
        try {
          const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
          dispatch(addUser(profileRes.data));
          toast.success('GitHub signup successful!');
          navigate("/");
        } catch (err) {
          setError("Failed to fetch profile after GitHub signup");
          toast.error("Failed to fetch profile after GitHub signup");
        } finally {
          setOauthLoading(false);
        }
      } else if (event.data === "devsync_github_auth_error") {
        window.removeEventListener("message", messageListener);
        setError("GitHub authentication failed");
        toast.error("GitHub authentication failed");
        setOauthLoading(false);
      }
    };

    window.addEventListener("message", messageListener);

    const popupWatcher = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupWatcher);
        setTimeout(() => {
          window.removeEventListener("message", messageListener);
          setOauthLoading(false);
        }, 500);
      }
    }, 500);
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
          isLoading={oauthLoading && loadingText.includes('GitHub')} 
          loadingText={loadingText} 
        />

        <div className="w-full">
          <GoogleLogin 
            onSuccess={handleGoogleLogin} 
            onError={() => {
              setError("Google signup failed");
              toast.error("Google signup failed");
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
