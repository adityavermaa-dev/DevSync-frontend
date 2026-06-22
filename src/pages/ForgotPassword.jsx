import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import logo from '../assests/images/logo.svg';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Please enter a valid email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
        if (apiError) setApiError("");
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setApiError("");

        try {
            const response = await axios.post(BASE_URL + "/forgot-password", {
                email: email.trim()
            }, { withCredentials: true });

            toast.success(response.data.message || "If an account exists, a reset email has been sent");
            setEmailSent(true);
            setEmail("");
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Something went wrong. Please try again.";
            const errorMsg = typeof msg === "string" ? msg : "Something went wrong. Please try again.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

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
                <div className="auth-modal" style={{ animation: 'modalSlideUp 0.4s ease-out', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <header className="auth-header">
                        <h2 className="auth-title">Forgot Password?</h2>
                    </header>

                    {apiError && (
                        <div className="auth-error-toast" role="alert">
                            <span>{apiError}</span>
                        </div>
                    )}

                    {emailSent ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px', color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Check Your Email</h2>
                            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                                If an account exists with this email, you'll receive a password reset link shortly.
                            </p>
                            <button className="auth-submit-btn" style={{ width: '100%' }} onClick={() => navigate("/login")}>
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <div className="auth-form-fields">
                            <p className="auth-subtitle" style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '0.5rem' }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <div className="auth-field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className={errors.email ? 'input-error' : ''}
                                    value={email}
                                    onChange={handleEmailChange}
                                    onKeyDown={handleKeyDown}
                                />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>

                            <button className="auth-submit-btn" onClick={handleSubmit} disabled={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                                {isLoading && <span className="auth-spinner"></span>}
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>

                            <button 
                                onClick={() => navigate("/login")}
                                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', transition: 'color 0.2s', width: '100%' }}
                                onMouseEnter={(e) => e.target.style.color = '#111827'}
                                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;
