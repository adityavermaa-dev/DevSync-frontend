import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Login.css';
import logo from '../assests/images/logo.png';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import AnimatedEmoji from '../components/AnimatedEmoji';

const Login = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    
    // Auth Modal visibility
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Emoji Happiness Hover state
    const [isHoveringCTA, setIsHoveringCTA] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(store => store.user);

    useEffect(() => {
        if (user) {
            return navigate("/");
        }
        
        // Check for modal state passed via routing
        if (location.state?.openModal && !showAuthModal) {
            setShowAuthModal(true);
            // clear the state from history so it doesn't accidentally reopen on page refresh
            window.history.replaceState({}, document.title);
        }

        axios.get(BASE_URL + "/profile/view", { withCredentials: true })
            .then((res) => {
                dispatch(addUser(res.data));
                navigate("/");
            })
            .catch(() => { });
    }, [user, navigate, dispatch, location]);

    const validate = () => {
        const newErrors = {};
        const trimmedEmail = email.trim();
        if (!isLogin) {
            if (!firstName.trim()) newErrors.firstName = "Required";
            if (!lastName.trim()) newErrors.lastName = "Required";
        }
        if (!trimmedEmail) {
            newErrors.email = "Required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Invalid email";
        }
        if (!password) {
            newErrors.password = "Required";
        } else if (password.length < 6) {
            newErrors.password = "Min 6 chars";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (setter, field) => (e) => {
        setter(e.target.value);
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
        if (apiError) setApiError("");
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setIsLoading(true);
        setApiError("");
        try {
            await axios.post(BASE_URL + "/login", { email: email.trim(), password }, { withCredentials: true });
            const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Welcome back!');
            navigate("/");
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || (error?.response?.status === 401 ? "Invalid email or password" : "Something went wrong.");
            const errorMsg = typeof msg === "string" ? msg : "Something went wrong.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setIsLoading(true);
            await axios.post(BASE_URL + "/auth/google/callback", { credential: credentialResponse.credential }, { withCredentials: true });
            const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Welcome back!');
            navigate("/");
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || "Google login failed.";
            const errorMsg = typeof msg === "string" ? msg : "Google login failed.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!validate()) return;
        setIsLoading(true);
        setApiError("");
        try {
            await axios.post(BASE_URL + "/signup", { email: email.trim(), password, firstName, lastName }, { withCredentials: true });
            toast.success('Account created! Please verify your email.');
            navigate("/signup-success");
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || "Something went wrong.";
            const errorMsg = typeof msg === "string" ? msg : "Something went wrong.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (isLogin) handleLogin();
            else handleSignUp();
        }
    };

    const openModal = () => setShowAuthModal(true);
    const closeModal = () => setShowAuthModal(false);

    // Mouse parallax effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = useCallback((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40; // -20 to +20 range
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        setMousePos({ x, y });
    }, []);

    return (
        <div 
            className="landing-page light-theme"
            onMouseMove={handleMouseMove}
            style={{ '--mx': `${mousePos.x}px`, '--my': `${mousePos.y}px` }}
        >
            {/* Soft ambient background circles */}
            <div className="landing-bg-circle circle-blue" />
            <div className="landing-bg-circle circle-pink" />
            <div className="landing-bg-circle circle-yellow" />

            <nav className="landing-navbar-container">
                <div className="landing-logo" style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="DevSync logo" />
                    <span>DevSync</span>
                </div>
                
                <div className="landing-nav-pill">
                    <button className="pill-item active">Find a Match</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/community')}>Community</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/about')}>About</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={openModal}>Sign In</button>
                </div>

                {/* Empty div for flex spacing alignment */}
                <div className="landing-nav-spacer"></div>
            </nav>

            <main className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Where developers find<br/>their perfect match.</h1>
                    <button 
                        className="hero-cta" 
                        onClick={openModal}
                        onMouseEnter={() => setIsHoveringCTA(true)}
                        onMouseLeave={() => setIsHoveringCTA(false)}
                    >
                        Start Matching Now
                    </button>
                </div>

                {/* Floating 3D Elements */}
                <div className="floating-item float-1 code-block block-green">
                    <span>{`</>`}</span>
                </div>
                <div className="floating-item float-2 code-block block-blue">
                    <span>{`{}`}</span>
                </div>
                <div className="floating-item float-3 code-block block-yellow-top">
                    <span>{`{}`}</span>
                </div>
                <div className="floating-item float-4 code-block block-green-light">
                    <span>{`//`}</span>
                </div>
                <div className="floating-item float-5 code-block block-yellow-bottom">
                    <span>{`//`}</span>
                </div>
                <div className="floating-item float-6 code-block block-purple-bottom">
                    <span>{`;`}</span>
                </div>
                <div className="floating-item float-7 code-block block-blue-sm">
                    <span>{`{}`}</span>
                </div>
                
                {/* 3D Emoji Avatar */}
                <div className="floating-item emoji-avatar float-slow">
                    <AnimatedEmoji mousePos={mousePos} isHappy={isHoveringCTA} />
                </div>
            </main>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="auth-modal-overlay" onClick={closeModal}>
                    <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="auth-close-btn" onClick={closeModal}>&times;</button>
                        <header className="auth-header">
                            <h2 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                            <p className="auth-subtitle">
                                {isLogin ? 'Continue to DevSync' : 'Join the developer community'}
                            </p>
                        </header>

                        {apiError && (
                            <div className="auth-error-toast" role="alert">
                                <span>{apiError}</span>
                            </div>
                        )}

                        <div className="auth-form-fields">
                            {!isLogin && (
                                <div className="auth-field-row">
                                    <div className="auth-field">
                                        <label htmlFor="firstName">First Name</label>
                                        <input 
                                            type="text" 
                                            id="firstName"
                                            value={firstName} 
                                            onChange={handleFieldChange(setFirstName, 'firstName')} 
                                            onKeyDown={handleKeyDown} 
                                            className={errors.firstName ? 'input-error' : ''} 
                                        />
                                        {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                                    </div>
                                    <div className="auth-field">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input 
                                            type="text" 
                                            id="lastName"
                                            value={lastName} 
                                            onChange={handleFieldChange(setLastName, 'lastName')} 
                                            onKeyDown={handleKeyDown} 
                                            className={errors.lastName ? 'input-error' : ''} 
                                        />
                                        {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                                    </div>
                                </div>
                            )}

                            <div className="auth-field">
                                <label htmlFor="email">Email address</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    value={email} 
                                    onChange={handleFieldChange(setEmail, 'email')} 
                                    onKeyDown={handleKeyDown} 
                                    className={errors.email ? 'input-error' : ''} 
                                />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>

                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    id="password"
                                    value={password} 
                                    onChange={handleFieldChange(setPassword, 'password')} 
                                    onKeyDown={handleKeyDown} 
                                    className={errors.password ? 'input-error' : ''} 
                                />
                                {errors.password && <span className="field-error">{errors.password}</span>}
                            </div>

                            {isLogin && (
                                <div className="auth-extras">
                                    <label className="auth-remember">
                                        <input type="checkbox" /> Remember me
                                    </label>
                                    <button type="button" onClick={() => navigate("/forgot-password")} className="auth-forgot">
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button 
                                className="auth-submit-btn" 
                                onClick={isLogin ? handleLogin : handleSignUp} 
                                disabled={isLoading}
                            >
                                {isLoading && <span className="auth-spinner"></span>}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </div>

                        <div className="auth-divider">
                            <span className="auth-divider-text">Or continue with</span>
                        </div>

                        <div className="auth-social-area">
                            <GoogleLogin 
                                onSuccess={handleGoogleLogin} 
                                onError={() => console.log("Login failed")}
                                size="large"
                                width="100%"
                                shape="rectangular"
                                text="continue_with"
                            />
                            <button className="auth-social-btn github" onClick={() => { window.location.href = "https://devsyncapp.in/api/auth/github"; }}>
                                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="auth-footer">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button className="auth-toggle-mode" onClick={() => { setIsLogin(!isLogin); setErrors({}); setApiError(''); }}>
                                {isLogin ? 'Create one' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
