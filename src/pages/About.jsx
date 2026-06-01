import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../assests/images/logo.png';
import './Login.css';

const About = () => {
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
                    <span>DevSync</span>
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
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/community')}>Community</button>
                    <button className="pill-item active">About</button>
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
                        <button className="mobile-menu-item" type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/community'); }}>Community</button>
                        <button className="mobile-menu-item active" type="button" onClick={() => setIsMobileMenuOpen(false)}>About</button>
                        <button className="mobile-menu-item" type="button" onClick={() => { setIsMobileMenuOpen(false); navigate(user ? '/' : '/login', user ? undefined : { state: { openModal: true } }); }}>
                            {user ? 'Dashboard' : 'Sign In'}
                        </button>
                    </div>
                )}
                <div className="landing-nav-spacer"></div>
            </nav>

            <main className="landing-hero landing-info-hero">
                <div className="hero-content landing-info-content">
                    <h1 className="hero-title landing-info-title">About DevSync</h1>
                    <p className="landing-info-text">
                        DevSync is the premier platform where passionate developers find their perfect match. Whether you're looking for coding collaborations, pair programming, or building the next big side project, we connect you with like-minded creators everywhere.
                    </p>
                </div>
                
                {}
                <div className="floating-item float-2 code-block block-blue">
                    <span>{`{}`}</span>
                </div>
                <div className="floating-item float-4 code-block block-green-light">
                    <span>{`
                </div>
            </main>
        </div>
    );
};

export default About;
