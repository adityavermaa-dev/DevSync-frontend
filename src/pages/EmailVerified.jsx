import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assests/images/logo.svg';
import './Login.css';

const EmailVerified = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/login");
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="landing-page">
            <div className="landing-bg-circle circle-blue" />
            <div className="landing-bg-circle circle-pink" />
            <div className="landing-bg-circle circle-yellow" />

            <nav className="landing-navbar-container">
                <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>
                    <img src={logo} alt="DevSync logo" />
                    <span className="brand-logo-text flex items-center"><img src="/devsync-wordmark.png" alt="DevSync" className="h-8 object-contain" style={{ transform: 'translateY(2px)' }} /></span>
                </div>
            </nav>

            <main className="landing-hero" style={{ justifyContent: 'center', paddingTop: '0' }}>
                <div className="auth-modal" style={{ animation: 'modalSlideUp 0.4s ease-out', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px', color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    
                    <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Email Verified!</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '2rem', color: '#374151', fontWeight: '500' }}>
                        Your email has been verified successfully. You can now log in to your account.
                    </p>

                    <button className="auth-submit-btn" onClick={() => navigate("/login")} style={{ width: '100%', marginBottom: '1rem' }}>
                        Go to Login
                    </button>

                    <p className="auth-subtitle" style={{ fontSize: '0.85rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        Redirecting in 3 seconds...
                    </p>
                </div>
            </main>
        </div>
    );
};

export default EmailVerified;
