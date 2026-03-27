import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../assests/images/logo.png';
import './Login.css';

const About = () => {
    const navigate = useNavigate();
    const user = useSelector(store => store.user);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = useCallback((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        setMousePos({ x, y });
    }, []);

    return (
        <div 
            className="landing-page light-theme"
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
                
                <div className="landing-nav-pill">
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/login')}>Find a Match</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/community')}>Community</button>
                    <button className="pill-item active">About</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate(user ? '/' : '/login')}>{user ? 'Dashboard' : 'Sign In'}</button>
                </div>
                <div className="landing-nav-spacer"></div>
            </nav>

            <main className="landing-hero" style={{ padding: '0 2rem' }}>
                <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>About DevSync</h1>
                    <p style={{ fontSize: '1.25rem', color: '#4b5563', lineHeight: '1.6', fontWeight: '500' }}>
                        DevSync is the premier platform where passionate developers find their perfect match. Whether you're looking for coding collaborations, pair programming, or building the next big side project, we connect you with like-minded creators everywhere.
                    </p>
                </div>
                
                {/* Float elements just for aesthetic */}
                <div className="floating-item float-2 code-block block-blue">
                    <span>{`{}`}</span>
                </div>
                <div className="floating-item float-4 code-block block-green-light">
                    <span>{`//`}</span>
                </div>
            </main>
        </div>
    );
};

export default About;
