import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import logo from '../assests/images/logo.png';
import './Login.css';

const ResetPassword = () => {
    // 1. Get the token from the URL parameters
    const { token } = useParams();
    const navigate = useNavigate();
    
    // State management
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);

    // Validate token presence on mount
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
        
        // Ensure token exists before making request
        if (!token) {
            setApiError("Invalid reset token.");
            return;
        }

        setIsLoading(true);
        setApiError("");

        try {
            // 2. Make a POST call to the route /reset-password/:token
            const response = await axios.post(
                BASE_URL + `/reset-password/${token}`,
                { password },
                { withCredentials: true }
            );

            toast.success(response.data.message || "Password reset successfully");
            setPasswordReset(true);
            
            // Redirect to login after success
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
        <div className="login-page">
            <div className="login-glow" />

            <div className="login-logo-area">
                <img src={logo} alt="DevSync" className="login-logo-icon" />
                <h1 className="login-brand-name">DevSync</h1>
                <p className="login-tagline">Create a new password for your account.</p>
            </div>

            <div className="login-card">
                {apiError && (
                    <div className="login-error-toast flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <span>{apiError}</span>
                    </div>
                )}

                {passwordReset ? (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="login-title mb-2">Password Reset Success!</h2>
                        <p className="login-subtitle mb-6">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="login-title">Reset Your Password</h2>
                        <p className="login-subtitle mb-6">
                            Enter your new password below.
                        </p>

                        <div className="login-field">
                            <label className="login-label">New Password</label>
                            <div className="login-password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="login-password-toggle"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <span className="login-error">{errors.password}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Confirm Password</label>
                            <div className="login-password-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className={`login-input ${errors.confirmPassword ? 'login-input-error' : ''}`}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="login-password-toggle"
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="login-error">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="login-btn w-full"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="login-btn-secondary w-full mt-3"
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
