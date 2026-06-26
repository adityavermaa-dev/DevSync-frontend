import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import React, { Suspense, lazy } from 'react';
import { Provider } from "react-redux"
import { Toaster } from 'react-hot-toast'
import appStore from "./redux/appStore"
import { ENABLE_PREMIUM } from "./constants/commonData";
import ThemeProvider from "./components/ThemeProvider"
import Body from "./Body"

import { LoginPage } from "./pages/Auth/LoginPage"
import { SignupPage } from "./pages/Auth/SignupPage"


const About = lazy(() => import("./pages/About"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const Feed = lazy(() => import("./pages/Feed"));
const Connections = lazy(() => import("./pages/connections"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Requests = lazy(() => import("./pages/Requests"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const VideoUpload = lazy(() => import("./components/VideoUpload"));
const VideoFeed = lazy(() => import("./components/VideoFeed"));
const Premium = ENABLE_PREMIUM ? lazy(() => import("./pages/Premium")) : null;
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmailVerified = lazy(() => import("./pages/EmailVerified"));
const VerificationFailed = lazy(() => import("./pages/VerificationFailed"));
const SignupSuccess = lazy(() => import("./pages/SignupSuccess"));
const Chat = lazy(() => import("./pages/Chat"));
const Projects = lazy(() => import("./pages/Projects"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const BuildLogs = lazy(() => import("./pages/BuildLogs"));
const Onboarding = lazy(() => import("./pages/Onboarding/ProfileSetup").then(module => ({ default: module.ProfileSetup })));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const VerifyEmailHandler = lazy(() => import("./pages/VerifyEmailHandler"));


import { LandingPage } from "./pages/Landing/LandingPage";

import { useDispatch, useSelector } from 'react-redux';
import { addUser } from './redux/userSlice';
import axios from 'axios';
import { BASE_URL } from './constants/commonData';

function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector(store => store.user);

  React.useEffect(() => {
    const fetchUser = async () => {
      if (user) return;
      try {
        const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
        dispatch(addUser(res.data));
      } catch (error) {
        // Not logged in, that's fine for public routes
      }
    };
    fetchUser();
  }, [dispatch, user]);

  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[#f9fafb] dark:bg-[#0D0D12]">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/google/callback" element={<AuthCallback provider="Google" />} />
              <Route path="/auth/github/callback" element={<AuthCallback provider="GitHub" />} />
              <Route path="/about" element={<About />} />
              <Route path="/community" element={<Community />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/verify-email" element={<VerifyEmailHandler />} />
              <Route path="/verify-email/:token" element={<VerifyEmailHandler />} />
              <Route path="/verification-failed" element={<VerificationFailed />} />
              <Route path="/verification-error" element={<VerificationFailed />} />
              <Route path="/signup-success" element={<SignupSuccess />} />
              
              <Route element={<Body />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/upload" element={<VideoUpload />} />
                <Route path="/feed" element={<VideoFeed />} />
                <Route path="/premium" element={ENABLE_PREMIUM && Premium ? <Premium /> : <Navigate to="/" replace />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:targetUserId" element={<Chat />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/new" element={<CreateProject />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/updates" element={<BuildLogs />} />
                <Route path="/build-logs" element={<BuildLogs />} />
                <Route path="/reels" element={<VideoFeed />} />
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Provider store={appStore}>
      <ThemeProvider>
        <BrowserRouter basename="/">
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            fontSize: '0.88rem',
            padding: '12px 18px',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: 'var(--bg-card)' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: 'var(--bg-card)' },
          },
        }}
      />
    </Provider>
  );
}

export default App;
