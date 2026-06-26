import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import { AuthLayout } from '@/features/auth';
import { Stack, Button, Text } from '@/design-system';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

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

    const handleSubmit = async (e) => {
        e?.preventDefault();
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
            const msg = error?.response?.data?.message || error?.response?.data || "Failed to reset password. The link may have expired.";
            const errorMsg = typeof msg === "string" ? msg : "Failed to reset password.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (passwordReset) {
        return (
            <AuthLayout title="Reset Success" subtitle="Your password has been successfully reset. Redirecting to login...">
                <Stack spacing="lg" className="mt-8 items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </Stack>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Reset Password" subtitle="Enter a new password for your account.">
            <Stack spacing="lg" className="mt-8">
                {apiError && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {apiError}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                className={`w-full h-11 px-3 pr-10 rounded-lg border bg-[var(--surface-elevated)] outline-none transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--color-primary)]'}`}
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password}</span>}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className={`w-full h-11 px-3 pr-10 rounded-lg border bg-[var(--surface-elevated)] outline-none transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--color-primary)]'}`}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="text-xs text-red-500 mt-1">{errors.confirmPassword}</span>}
                    </div>

                    <Button type="submit" variant="primary" className="h-11 mt-2" disabled={isLoading || !token}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>

                <Text className="text-center text-sm text-[var(--text-secondary)] mt-4">
                    Remember your password? <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">Back to Login</Link>
                </Text>
            </Stack>
        </AuthLayout>
    );
};

export default ResetPassword;
