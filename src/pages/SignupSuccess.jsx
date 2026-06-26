import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import logo from '../assests/images/logo.svg';
import './Login.css';

const SignupSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || "");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

    const handleResendEmail = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setApiError("");

        try {
            const response = await axios.post(
                BASE_URL + "/resend-verification",
                { email: email.trim() },
                { withCredentials: true }
            );

            toast.success(response.data.message || "Verification email sent!");
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Failed to resend verification email. Please try again.";
            const errorMsg = typeof msg === "string" ? msg : "Failed to resend verification email. Please try again.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleResendEmail();
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
                <div className="auth-modal" style={{ animation: 'modalSlideUp 0.4s ease-out', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    
                    {apiError && (
                        <div className="auth-error-toast" role="alert" style={{ marginBottom: '1.5rem' }}>
                            <span>{apiError}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px', color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0v-1.5A2.25 2.25 0 0019.5 3H4.5A2.25 2.25 0 002.25 5.25v1.5" />
                        </svg>
                    </div>
                    
                    <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Account Created!</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '1rem', color: '#374151', fontWeight: '500' }}>
                        Please verify your email to activate your account.
                    </p>
                    <p className="auth-subtitle" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Check your inbox for a verification link. If you don't see it, you can request a new one below.
                    </p>

                    <div className="auth-form-fields" style={{ textAlign: 'left' }}>
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

                        <button className="auth-submit-btn" onClick={handleResendEmail} disabled={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                            {isLoading && <span className="auth-spinner"></span>}
                            {isLoading ? "Sending..." : "Resend Verification Email"}
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
                </div>
            </main>
        </div>
    );
};

export default SignupSuccess;
