import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import { AuthLayout } from '@/features/auth';
import { Stack, Button, Text } from '@/design-system';
import { CheckCircle2 } from 'lucide-react';

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

    const handleSubmit = async (e) => {
        e?.preventDefault();
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
            const msg = error?.response?.data?.message || error?.response?.data || "Something went wrong. Please try again.";
            const errorMsg = typeof msg === "string" ? msg : "Something went wrong. Please try again.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <AuthLayout title="Check Your Email" subtitle="If an account exists with this email, you'll receive a password reset link shortly.">
                <Stack spacing="lg" className="mt-8 items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <Button variant="primary" className="w-full h-11" onClick={() => navigate("/login")}>
                        Back to Login
                    </Button>
                </Stack>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Forgot Password?" subtitle="Enter your email address and we'll send you a link to reset your password.">
            <Stack spacing="lg" className="mt-8">
                {apiError && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {apiError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium">Email Address</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className={`h-11 px-3 rounded-lg border bg-[var(--surface-elevated)] outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--color-primary)]'}`}
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
                    </div>

                    <Button type="submit" variant="primary" className="h-11 mt-2" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>

                <Text className="text-center text-sm text-[var(--text-secondary)] mt-4">
                    Remember your password? <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">Back to Login</Link>
                </Text>
            </Stack>
        </AuthLayout>
    );
};

export default ForgotPassword;
