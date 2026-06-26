import React, { useEffect, useState, useCallback, useRef } from 'react';
import './Landing.css';
import logo from '../assests/images/logo.svg';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const FEATURES = [
    {
        icon: '\u{1F9E0}',
        title: 'Smart Developer Matching',
        desc: 'Our multi-factor algorithm matches you with developers based on tech stack, experience, timezone, and GitHub activity.',
        accent: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
        featured: true,
    },
    {
        icon: '\u{1F680}',
        title: 'Project Collaboration',
        desc: 'Create or join projects with built-in task boards, auto-provisioned team chats, and real-time member management.',
        accent: 'linear-gradient(90deg, #3b82f6, #6366f1)',
    },
    {
        icon: '\u{1F4AC}',
        title: 'Real-Time Chat',
        desc: 'Direct and group messaging with typing indicators, read receipts, and live online presence detection.',
        accent: 'linear-gradient(90deg, #10b981, #34d399)',
    },
    {
        icon: '\u{1F4DD}',
        title: 'Build Logs',
        desc: 'Share your dev journey with tagged posts, likes, and comments. Like a dev blog built for makers.',
        accent: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    },
    {
        icon: '\u{1F525}',
        title: 'Daily Streaks & Badges',
        desc: 'Stay motivated with daily streaks, GitHub-style contribution heatmaps, and milestone badges.',
        accent: 'linear-gradient(90deg, #ef4444, #f97316)',
    },
    {
        icon: '\u{1F4F9}',
        title: 'Dev Reels',
        desc: 'Upload short-form video content to showcase projects, tutorials, or coding sessions.',
        accent: 'linear-gradient(90deg, #ec4899, #f43f5e)',
    },
];

const PROJECTS = [
    {
        name: 'NebulaUI',
        desc: 'Open-source design system with 50+ accessible components for React.',
        status: 'Open',
        stack: ['React', 'TypeScript', 'Storybook'],
        emoji: '\u{2728}',
    },
    {
        name: 'CodeFlow',
        desc: 'Real-time collaborative code editor with integrated terminal and git.',
        status: 'Building',
        stack: ['Node.js', 'WebSocket', 'Docker'],
        emoji: '\u{1F680}',
    },
    {
        name: 'DataPulse',
        desc: 'Analytics dashboard with live metrics, custom query builder, and AI insights.',
        status: 'Completed',
        stack: ['Python', 'FastAPI', 'D3.js'],
        emoji: '\u{1F4CA}',
    },
];

const TESTIMONIALS = [
    {
        text: "DevSync matched me with a builder who shares my exact stack. We shipped our first project together in 2 weeks.",
        name: 'Ananya S.',
        role: 'Full-Stack Developer',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    },
    {
        text: "The real-time chat and project boards make collaboration feel effortless. It's like having a dev team in your pocket.",
        name: 'Rahul K.',
        role: 'Backend Engineer',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
    },
    {
        text: "I've tried every dev networking app out there. DevSync is the only one that actually understands what developers need.",
        name: 'Priya M.',
        role: 'ML Engineer',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna',
    },
];

const STATS = [
    { value: '10K+', label: 'Developers Matched', accent: true },
    { value: '2.5K+', label: 'Projects Launched', accent: false },
    { value: '98%', label: 'Match Satisfaction', accent: true },
    { value: '150K+', label: 'Messages Sent', accent: false },
];

const HOW_STEPS = [
    { title: 'Sign Up', desc: 'Create your profile with GitHub integration in seconds.' },
    { title: 'Get Matched', desc: 'Our algorithm finds developers aligned with your stack and goals.' },
    { title: 'Connect', desc: 'Chat in real-time, join projects, and start building together.' },
    { title: 'Ship', desc: 'Collaborate on projects, track progress, and launch products.' },
];

const CODE_LINES = [
    { delay: 0, text: '<span class="lp-code-comment">// find your dev match</span>' },
    { delay: 400, text: '<span class="lp-code-keyword">const</span> <span class="lp-code-func">match</span> = <span class="lp-code-keyword">await</span> devSync.<span class="lp-code-func">findMatch</span>(<span class="lp-code-bracket">{</span>' },
    { delay: 800, text: '  <span class="lp-code-prop">skills</span>: [<span class="lp-code-string">"React"</span>, <span class="lp-code-string">"Node"</span>],' },
    { delay: 1200, text: '  <span class="lp-code-prop">timezone</span>: <span class="lp-code-string">"IST"</span>,' },
    { delay: 1600, text: '  <span class="lp-code-prop">availability</span>: <span class="lp-code-string">"Evenings"</span>' },
    { delay: 2000, text: '<span class="lp-code-bracket">}</span>);' },
    { delay: 2400, text: '' },
    { delay: 2600, text: '<span class="lp-code-comment">// match found \u2714\uFE0F</span>' },
    { delay: 3000, text: '<span class="lp-code-keyword">const</span> <span class="lp-code-func">project</span> = <span class="lp-code-keyword">await</span> match.<span class="lp-code-func">startProject</span>();' },
];

const PARTICLE_COUNT = 60;

function ParticleCanvas() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouse = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouse);

        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const lightMode = document.documentElement.getAttribute('data-theme') === 'light';
            const baseR = lightMode ? 99 : 138;
            const baseG = lightMode ? 102 : 92;
            const baseB = lightMode ? 241 : 246;
            const particles = particlesRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${p.opacity})`;
                ctx.fill();

                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    const other = particles[(i + 1) % particles.length];
                    const odx = mouseRef.current.x - other.x;
                    const ody = mouseRef.current.y - other.y;
                    const odist = Math.sqrt(odx * odx + ody * ody);
                    if (odist < 200) {
                        ctx.lineTo(other.x, other.y);
                    }
                    ctx.strokeStyle = `rgba(${baseR},${baseG},${baseB},${0.08 * (1 - dist / 200)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const ddx = p.x - p2.x;
                    const ddy = p.y - p2.y;
                    const dd = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (dd < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${baseR},${baseG},${baseB},${0.06 * (1 - dd / 120)})`;
                        ctx.lineWidth = 0.4;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
        };
    }, []);

    return <canvas ref={canvasRef} className="lp-particles-canvas" />;
}

function useScrollReveal() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        const children = el.querySelectorAll('.lp-reveal');
        children.forEach((child) => observer.observe(child));

        return () => observer.disconnect();
    }, []);

    return ref;
}

const Landing = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const mobileMenuRef = useRef(null);
    const hamburgerBtnRef = useRef(null);
    const pageRef = useScrollReveal();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((store) => store.user);

    const isEmailVerificationRequiredMessage = (value) => {
        const text = String(value || '').toLowerCase();
        return text.includes('verify') && text.includes('email');
    };

    const fetchInitialUser = useCallback(async () => {
        try {
            const res = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
            dispatch(addUser(res.data));
            navigate('/');
            return true;
        } catch {
            return false;
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        if (user) return navigate('/');

        if (location.state?.openModal && !showAuthModal) {
            setShowAuthModal(true);
            window.history.replaceState({}, document.title);
        }

        fetchInitialUser();
    }, [user, navigate, dispatch, location, showAuthModal, fetchInitialUser]);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const handleClickOutside = (event) => {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                hamburgerBtnRef.current &&
                !hamburgerBtnRef.current.contains(event.target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    const validate = () => {
        const newErrors = {};
        const trimmedEmail = email.trim();
        if (!isLogin) {
            if (!firstName.trim()) newErrors.firstName = 'Required';
            if (!lastName.trim()) newErrors.lastName = 'Required';
        }
        if (!trimmedEmail) {
            newErrors.email = 'Required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = 'Invalid email';
        }
        if (!password) {
            newErrors.password = 'Required';
        } else if (password.length < 6) {
            newErrors.password = 'Min 6 chars';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (setter, field) => (e) => {
        setter(e.target.value);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
        if (apiError) setApiError('');
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setIsLoading(true);
        setApiError('');
        try {
            await axios.post(BASE_URL + '/login', { email: email.trim(), password }, { withCredentials: true });
            const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || (error?.response?.status === 401 ? 'Invalid email or password' : 'Something went wrong.');
            const errorMsg = typeof msg === 'string' ? msg : 'Something went wrong.';
            if (isEmailVerificationRequiredMessage(errorMsg)) {
                toast.error(errorMsg);
                navigate('/signup-success', { state: { email: email.trim() } });
                return;
            }
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setIsLoading(true);
            await axios.post(BASE_URL + '/auth/google/callback', { credential: credentialResponse.credential }, { withCredentials: true });
            const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Google login failed.';
            const errorMsg = typeof msg === 'string' ? msg : 'Google login failed.';
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubLogin = () => {
        setIsLoading(true);
        setApiError('');
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(`${BASE_URL}/auth/github`, 'devsync_github_auth', `width=${width},height=${height},left=${left},top=${top}`);

        if (!popup) {
            toast.error('Please allow popups for GitHub login');
            setIsLoading(false);
            return;
        }

        const messageListener = async (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data === 'devsync_github_auth_success') {
                window.removeEventListener('message', messageListener);
                clearInterval(popupWatcher);
                try {
                    const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
                    dispatch(addUser(profileRes.data));
                    toast.success('GitHub login successful!');
                    navigate('/');
                } catch {
                    setApiError('Failed to fetch profile after GitHub login');
                    toast.error('Failed to fetch profile after GitHub login');
                } finally {
                    setIsLoading(false);
                }
            } else if (event.data === 'devsync_github_auth_error') {
                window.removeEventListener('message', messageListener);
                clearInterval(popupWatcher);
                setApiError('GitHub authentication failed');
                toast.error('GitHub authentication failed');
                setIsLoading(false);
            }
        };

        window.addEventListener('message', messageListener);

        const popupWatcher = setInterval(() => {
            if (popup.closed) {
                clearInterval(popupWatcher);
                setTimeout(() => {
                    window.removeEventListener('message', messageListener);
                    setIsLoading(false);
                }, 500);
            }
        }, 500);
    };

    const handleSignUp = async () => {
        if (!validate()) return;
        setIsLoading(true);
        setApiError('');
        try {
            const trimmedEmail = email.trim();
            const signupRes = await axios.post(BASE_URL + '/signup', { email: trimmedEmail, password, firstName, lastName }, { withCredentials: true });

            const signupMsg = String(signupRes?.data?.message || '').toLowerCase();
            const backendConfirmedVerificationEmail =
                signupRes?.data?.verificationEmailSent === true ||
                signupRes?.data?.emailSent === true ||
                signupMsg.includes('verification email sent');

            if (!backendConfirmedVerificationEmail) {
                try {
                    await axios.post(BASE_URL + '/resend-verification', { email: trimmedEmail }, { withCredentials: true });
                } catch {
                    // verification email fallback - ignore error
                }
            }

            toast.success('Account created! Please verify your email.');
            navigate('/signup-success', { state: { email: trimmedEmail } });
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Something went wrong.';
            const errorMsg = typeof msg === 'string' ? msg : 'Something went wrong.';
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (isLogin) handleLogin();
            else handleSignUp();
        }
    };

    const openModal = () => setShowAuthModal(true);
    const closeModal = () => setShowAuthModal(false);

    return (
        <div
            className="landing-page public-landing"
            ref={pageRef}
            style={{ '--mx': `${mousePos.x}px`, '--my': `${mousePos.y}px` }}
        >
            <ParticleCanvas />

            <div className="lp-mesh-gradient">
                <div className="lp-mesh-blob lp-mesh-blob-1" />
                <div className="lp-mesh-blob lp-mesh-blob-2" />
                <div className="lp-mesh-blob lp-mesh-blob-3" />
                <div className="lp-mesh-blob lp-mesh-blob-4" />
            </div>

            <div className="lp-grid-overlay" />

            {/* ===== NAVBAR ===== */}
            <nav className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="lp-navbar-inner">
                    <div className="lp-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src={logo} alt="DevSync" />
                        <span className="lp-nav-logo-text">DevSync</span>
                    </div>

                    <div className="lp-nav-links">
                        <button className="lp-nav-link active">Features</button>
                        <button className="lp-nav-link" onClick={() => navigate('/community')}>Community</button>
                        <button className="lp-nav-link" onClick={() => navigate('/about')}>About</button>
                    </div>

                    <div className="lp-nav-actions">
                        <button className="lp-nav-login" onClick={openModal}>Sign In</button>
                        <button className="lp-nav-cta" onClick={openModal}>Get Started</button>
                    </div>

                    <button
                        ref={hamburgerBtnRef}
                        className="lp-hamburger"
                        aria-label="Toggle navigation"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <button className="lp-mobile-backdrop open" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" />
            )}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="lp-mobile-menu open">
                    <button className="lp-mobile-menu-item active" onClick={() => setIsMobileMenuOpen(false)}>Features</button>
                    <button className="lp-mobile-menu-item" onClick={() => { setIsMobileMenuOpen(false); navigate('/community'); }}>Community</button>
                    <button className="lp-mobile-menu-item" onClick={() => { setIsMobileMenuOpen(false); navigate('/about'); }}>About</button>
                    <button className="lp-mobile-menu-item" onClick={() => { setIsMobileMenuOpen(false); openModal(); }}>Sign In</button>
                    <button className="lp-mobile-menu-item" onClick={() => { setIsMobileMenuOpen(false); openModal(); }} style={{ fontWeight: 700, color: '#8b5cf6' }}>Get Started Free</button>
                </div>
            )}

            {/* ===== HERO ===== */}
            <section className="lp-hero">
                <div className="lp-hero-badge">
                    <span className="lp-hero-badge-dot" />
                    Live matching is active
                </div>

                <h1 className="lp-hero-title">
                    Where developers<br />
                    find their <span className="lp-hero-title-accent">perfect match.</span>
                </h1>

                <p className="lp-hero-subtitle">
                    Connect with builders who match your stack, vibe, and project goals. AI-powered matching, real-time chat, and built-in project collaboration.
                </p>

                <div className="lp-hero-actions">
                    <button className="lp-hero-cta-primary" onClick={openModal}>Start Matching Now</button>
                    <button className="lp-hero-cta-secondary" onClick={() => document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' })}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                        See How It Works
                    </button>
                </div>

                <div className="lp-hero-social-proof">
                    <div className="lp-hero-avatars">
                        <img className="lp-hero-avatar" src="https://api.dicebear.com/9.x/avataaars/svg?seed=Ashwin" alt="" />
                        <img className="lp-hero-avatar" src="https://api.dicebear.com/9.x/avataaars/svg?seed=Neha" alt="" />
                        <img className="lp-hero-avatar" src="https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram" alt="" />
                        <img className="lp-hero-avatar" src="https://api.dicebear.com/9.x/avataaars/svg?seed=Diya" alt="" />
                        <img className="lp-hero-avatar" src="https://api.dicebear.com/9.x/avataaars/svg?seed=Kabir" alt="" />
                    </div>
                    <div className="lp-hero-social-text">
                        <strong>10,000+</strong> developers<br />already building together
                    </div>
                </div>

                {/* Floating code blocks */}
                <div className="lp-code-block lp-code-block-1" style={{ transform: `translate(var(--mx), var(--my))` }}>{`</>`}</div>
                <div className="lp-code-block lp-code-block-2" style={{ transform: `translate(var(--mx), var(--my))` }}>{`{}`}</div>
                <div className="lp-code-block lp-code-block-3" style={{ transform: `translate(var(--mx), var(--my))` }}>{`;`}</div>
                <div className="lp-code-block lp-code-block-4" style={{ transform: `translate(var(--mx), var(--my))` }}>{`()`}</div>

                {/* Code terminal visual */}
                <div className="lp-hero-visual">
                    <div className="lp-code-terminal">
                        <div className="lp-code-terminal-header">
                            <span className="lp-code-terminal-dot red" />
                            <span className="lp-code-terminal-dot yellow" />
                            <span className="lp-code-terminal-dot green" />
                        </div>
                        {CODE_LINES.map((line, i) => (
                            <span
                                key={i}
                                className="lp-code-line"
                                style={{ animationDelay: `${line.delay}ms` }}
                                dangerouslySetInnerHTML={{ __html: line.text || '&nbsp;' }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="lp-section" id="lp-features">
                <div className="lp-reveal">
                    <span className="lp-section-label">Features</span>
                    <h2 className="lp-section-title">Everything you need to<br />build, together.</h2>
                    <p className="lp-section-subtitle">From smart matching to project management, DevSync gives developers the tools they actually want.</p>
                </div>

                <div className="lp-features-grid">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            className={`lp-feature-card lp-reveal ${f.featured ? 'featured' : ''} lp-reveal-delay-${(i % 4) + 1}`}
                            style={{ '--lp-feature-accent': f.accent }}
                        >
                            <div className="lp-feature-icon" style={{ background: f.accent.replace('linear-gradient', 'linear-gradient') }}>{f.icon}</div>
                            <h3 className="lp-feature-title">{f.title}</h3>
                            <p className="lp-feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="lp-stats-section">
                <div className="lp-stats-inner lp-reveal">
                    {STATS.map((s, i) => (
                        <div key={i} className="lp-stat-item">
                            <div className="lp-stat-number">
                                {s.accent ? <span className="lp-stat-accent">{s.value}</span> : s.value}
                            </div>
                            <div className="lp-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="lp-section" id="lp-how">
                <div className="lp-reveal" style={{ textAlign: 'center' }}>
                    <span className="lp-section-label">How It Works</span>
                    <h2 className="lp-section-title">From signup to shipped<br />in four steps.</h2>
                </div>

                <div className="lp-how-steps">
                    {HOW_STEPS.map((step, i) => (
                        <div key={i} className="lp-step-item lp-reveal lp-reveal-delay-${i + 1}">
                            <div className="lp-step-number">{i + 1}</div>
                            <h3 className="lp-step-title">{step.title}</h3>
                            <p className="lp-step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== PROJECT SHOWCASE ===== */}
            <section className="lp-section" id="lp-projects">
                <div className="lp-reveal">
                    <span className="lp-section-label">Project Showcase</span>
                    <h2 className="lp-section-title">Real projects, built by<br />real teams.</h2>
                    <p className="lp-section-subtitle">See what DevSync teams are shipping right now.</p>
                </div>

                <div className="lp-projects-row">
                    {PROJECTS.map((p, i) => (
                        <div key={i} className="lp-project-card lp-reveal lp-reveal-delay-${i + 1}">
                            <div className="lp-project-cover">{p.emoji}</div>
                            <div className="lp-project-body">
                                <span className={`lp-project-tag ${p.status.toLowerCase()}`}>{p.status}</span>
                                <h3 className="lp-project-name">{p.name}</h3>
                                <p className="lp-project-desc">{p.desc}</p>
                                <div className="lp-project-stack">
                                    {p.stack.map((t, j) => (
                                        <span key={j} className="lp-project-stack-tag">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="lp-section" id="lp-testimonials">
                <div className="lp-reveal">
                    <span className="lp-section-label">Testimonials</span>
                    <h2 className="lp-section-title">Loved by developers<br />everywhere.</h2>
                </div>

                <div className="lp-testimonials-grid">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="lp-testimonial-card lp-reveal lp-reveal-delay-${i + 1}">
                            <div className="lp-testimonial-stars">{'\u2605\u2605\u2605\u2605\u2605'}</div>
                            <p className="lp-testimonial-text">"{t.text}"</p>
                            <div className="lp-testimonial-author">
                                <img className="lp-testimonial-avatar" src={t.avatar} alt={t.name} />
                                <div>
                                    <div className="lp-testimonial-name">{t.name}</div>
                                    <div className="lp-testimonial-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="lp-cta-section">
                <div className="lp-cta-inner lp-reveal">
                    <h2 className="lp-cta-title">Ready to find your<br />dev match?</h2>
                    <p className="lp-cta-desc">Join thousands of developers who are already building, shipping, and growing together on DevSync.</p>
                    <button className="lp-cta-btn" onClick={openModal}>Get Started Free</button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <img src={logo} alt="DevSync" />
                        <span className="lp-footer-brand-text">DevSync</span>
                    </div>
                    <span className="lp-footer-copy">&copy; {new Date().getFullYear()} DevSync. Built for developers, by developers.</span>
                    <div className="lp-footer-links">
                        <button className="lp-footer-link" onClick={() => navigate('/privacy')}>Privacy</button>
                        <button className="lp-footer-link" onClick={() => navigate('/terms')}>Terms</button>
                        <button className="lp-footer-link" onClick={() => navigate('/contact')}>Contact</button>
                    </div>
                </div>
            </footer>

            {/* ===== AUTH MODAL ===== */}
            {showAuthModal && (
                <div className="auth-modal-overlay" onClick={closeModal}>
                    <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="auth-close-btn" onClick={closeModal}>&times;</button>
                        <header className="auth-header">
                            <h2 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                            <p className="auth-subtitle">{isLogin ? 'Continue to DevSync' : 'Join the developer community'}</p>
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
                                        <input type="text" id="firstName" value={firstName} onChange={handleFieldChange(setFirstName, 'firstName')} onKeyDown={handleKeyDown} className={errors.firstName ? 'input-error' : ''} />
                                        {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                                    </div>
                                    <div className="auth-field">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input type="text" id="lastName" value={lastName} onChange={handleFieldChange(setLastName, 'lastName')} onKeyDown={handleKeyDown} className={errors.lastName ? 'input-error' : ''} />
                                        {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                                    </div>
                                </div>
                            )}

                            <div className="auth-field">
                                <label htmlFor="email">Email address</label>
                                <input type="email" id="email" value={email} onChange={handleFieldChange(setEmail, 'email')} onKeyDown={handleKeyDown} className={errors.email ? 'input-error' : ''} />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>

                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <div className="password-input-wrap">
                                    <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={handleFieldChange(setPassword, 'password')} onKeyDown={handleKeyDown} className={errors.password ? 'input-error' : ''} />
                                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {errors.password && <span className="field-error">{errors.password}</span>}
                            </div>

                            {isLogin && (
                                <div className="auth-extras">
                                    <label className="auth-remember"><input type="checkbox" /> Remember me</label>
                                    <button type="button" onClick={() => navigate('/forgot-password')} className="auth-forgot">Forgot Password?</button>
                                </div>
                            )}

                            <button className="auth-submit-btn" onClick={isLogin ? handleLogin : handleSignUp} disabled={isLoading}>
                                {isLoading && <span className="auth-spinner"></span>}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </div>

                        <div className="auth-divider"><span className="auth-divider-text">Or continue with</span></div>

                        <div className="auth-social-area">
                            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log('Login failed')} size="large" width="100%" shape="rectangular" text="continue_with" />
                            <button className="auth-social-btn github" onClick={handleGitHubLogin}>
                                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="auth-footer">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
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

export default Landing;
