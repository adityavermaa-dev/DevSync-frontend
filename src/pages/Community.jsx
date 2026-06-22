import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../assests/images/logo.svg';
import './Login.css';

const Community = () => {
    const navigate = useNavigate();
    const user = useSelector(store => store.user);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);
    const hamburgerBtnRef = useRef(null);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = useCallback((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        setMousePos({ x, y });
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

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

    return (
        <div 
            className="landing-page public-landing"
            onMouseMove={handleMouseMove}
            style={{ '--mx': `${mousePos.x}px`, '--my': `${mousePos.y}px` }}
        >
            <div className="landing-bg-circle circle-blue" />
            <div className="landing-bg-circle circle-pink" />
            <div className="landing-bg-circle circle-yellow" />

            <nav className="landing-navbar-container">
                <div className="landing-logo cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>
                    <img src={logo} alt="DevSync logo" />
                    <span className="brand-logo-text flex items-center"><img src="/devsync-wordmark.png" alt="DevSync" className="h-8 object-contain" style={{ transform: 'translateY(2px)' }} /></span>
                </div>

                <button
                    type="button"
                    ref={hamburgerBtnRef}
                    className="landing-hamburger-btn"
                    aria-label="Toggle navigation"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                </button>
                
                <div className="landing-nav-pill">
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/login')}>Find a Match</button>
                    <button className="pill-item active">Community</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/about')}>About</button>
                    <button
                        className="pill-item"
                        style={{ color: '#4b5563' }}
                        onClick={() => navigate(user ? '/' : '/login', user ? undefined : { state: { openModal: true } })}
                    >
                        {user ? 'Dashboard' : 'Sign In'}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <button
                        type="button"
                        aria-label="Close mobile navigation"
                        className="landing-mobile-backdrop"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="landing-mobile-menu">
                        <button className="mobile-menu-item" type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Find a Match</button>
                        <button className="mobile-menu-item active" type="button" onClick={() => setIsMobileMenuOpen(false)}>Community</button>
                        <button className="mobile-menu-item" type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/about'); }}>About</button>
                        <button className="mobile-menu-item" type="button" onClick={() => { setIsMobileMenuOpen(false); navigate(user ? '/' : '/login', user ? undefined : { state: { openModal: true } }); }}>
                            {user ? 'Dashboard' : 'Sign In'}
                        </button>
                    </div>
                )}

                <div className="landing-nav-spacer"></div>
            </nav>

            <main className="landing-hero landing-info-hero">
                <div className="hero-content landing-info-content">
                    <h1 className="hero-title landing-info-title">The Developer Community</h1>
                    <p className="landing-info-text">
                        Join thousands of developers around the world. Connect, share your code, participate in forums, and grow your open-source projects together with a supportive network.
                    </p>
                    <button className="hero-cta landing-info-cta" onClick={() => navigate(user ? '/feed' : '/login', { state: { openModal: true } })}>
                        {user ? 'Go to Feed' : 'Join the Community'}
                    </button>
                </div>

                <div className="floating-item float-1 code-block block-green">
                    <span>{`</>`}</span>
                </div>
                <div className="floating-item float-6 code-block block-purple-bottom">
                    <span>{`;`}</span>
                </div>
            </main>
        </div>
    );
};

export default Community;
