import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import logo from '../assests/images/logo.svg';
import './Login.css';

const ResetPassword = () => {
    
    const { token } = useParams();
    const navigate = useNavigate();
    
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);

    
    useEffect(() => {
        if (!token) {
            setApiError("Invalid or missing reset token.");
        }
    }, [token]);

    const validate = () => {
        const newErrors = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
        if (apiError) setApiError("");
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
        if (apiError) setApiError("");
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        
        
        if (!token) {
            setApiError("Invalid reset token.");
            return;
        }

        setIsLoading(true);
        setApiError("");

        try {
            
            const response = await axios.post(
                BASE_URL + `/reset-password/${token}`,
                { password },
                { withCredentials: true }
            );

            toast.success(response.data.message || "Password reset successfully");
            setPasswordReset(true);
            
            
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Failed to reset password. The link may have expired.";
            const errorMsg = typeof msg === "string" ? msg : "Failed to reset password.";
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
                        <h2 className="auth-title">Reset Password</h2>
                    </header>

                    {apiError && (
                        <div className="auth-error-toast" role="alert">
                            <span>{apiError}</span>
                        </div>
                    )}

                    {passwordReset ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px', color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Reset Success</h2>
                            <p className="auth-subtitle" style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                                Your password has been successfully reset. Redirecting to login...
                            </p>
                        </div>
                    ) : (
                        <div className="auth-form-fields">
                            <p className="auth-subtitle" style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '0.5rem' }}>
                                Enter a new password for your account.
                            </p>

                            <div className="auth-field">
                                <label>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        className={errors.password ? 'input-error' : ''}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onKeyDown={handleKeyDown}
                                        style={{ width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && <span className="field-error">{errors.password}</span>}
                            </div>

                            <div className="auth-field">
                                <label>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className={errors.confirmPassword ? 'input-error' : ''}
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        onKeyDown={handleKeyDown}
                                        style={{ width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                            </div>

                            <button className="auth-submit-btn" onClick={handleSubmit} disabled={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                                {isLoading && <span className="auth-spinner"></span>}
                                {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
