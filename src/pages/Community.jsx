import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../assests/images/logo.png';
import './Login.css';

const Community = () => {
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
                    <button className="pill-item active">Community</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate('/about')}>About</button>
                    <button className="pill-item" style={{ color: '#4b5563' }} onClick={() => navigate(user ? '/' : '/login')}>{user ? 'Dashboard' : 'Sign In'}</button>
                </div>

                <div className="landing-nav-spacer"></div>
            </nav>

            <main className="landing-hero" style={{ padding: '0 2rem' }}>
                <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>The Developer Community</h1>
                    <p style={{ fontSize: '1.25rem', color: '#4b5563', lineHeight: '1.6', fontWeight: '500' }}>
                        Join thousands of developers around the world. Connect, share your code, participate in forums, and grow your open-source projects together with a supportive network.
                    </p>
                    <button className="hero-cta" style={{ marginTop: '2.5rem' }} onClick={() => navigate(user ? '/feed' : '/login', { state: { openModal: true } })}>
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
