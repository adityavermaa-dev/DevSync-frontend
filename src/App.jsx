import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Body from "./Body"
import Login from "./pages/Login"
import About from "./pages/About"
import Community from "./pages/Community"
import Profile from "./pages/Profile"
import { Provider } from "react-redux"
import appStore from "./redux/appStore"
import Feed from "./pages/Feed"
import Connections from "./pages/connections"
import UserProfile from "./pages/UserProfile"
import Requests from "./pages/Requests"
import { Toaster } from 'react-hot-toast'
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import RefundPolicy from "./pages/RefundPolicy"
import ContactUs from "./pages/ContactUs"
import VideoUpload from "./components/VideoUpload"
import VideoFeed from "./components/VideoFeed"
import Premium from "./pages/Premium"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import EmailVerified from "./pages/EmailVerified"
import VerificationFailed from "./pages/VerificationFailed"
import SignupSuccess from "./pages/SignupSuccess"
import Chat from "./pages/Chat"


function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/verification-failed" element={<VerificationFailed />} />
            <Route path="/verification-error" element={<VerificationFailed />} />
            <Route path="/signup-success" element={<SignupSuccess />} />
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Feed />} />
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
              <Route path="/premium" element={<Premium />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:targetUserId" element={<Chat />} />
            </Route>
          </Routes>
        </BrowserRouter>
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
    </>
  )
}

export default App
