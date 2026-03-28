import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Premium.css";
import { BASE_URL } from "../constants/commonData";
import axios from "axios";

const Premium = () => {
    const user = useSelector((store) => store.user);
    const navigate = useNavigate();
    const [isUserPremium, setIsUserPremium] = useState(false);

    const verifyPremiumUser = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/premium/verify`, {
                withCredentials: true,
            });
            if (res.data.isPremium) {
                setIsUserPremium(true);
            }
        } catch (err) {
            console.error("Premium verification failed", err);
        }
    };

    useEffect(() => {
        verifyPremiumUser();
    }, []);

    const verifyPayment = async (response) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/payment/verify`,
                response,
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success("Payment successful 🎉");
                setIsUserPremium(true);
            }
        } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed");
        }
    };

    const handlePurchase = async (type) => {
        try {
            if (!user) {
                toast.error("Please login to purchase premium");
                navigate("/login");
                return;
            }

            if (isUserPremium) {
                toast("You already have premium!");
                return;
            }

            const order = await axios.post(
                `${BASE_URL}/payment/create`,
                { membershipType: type },
                { withCredentials: true }
            );

            const { amount, keyId, currency, notes, orderId } = order.data;

            if (!window.Razorpay) {
                toast.error("Payment system not loaded");
                return;
            }

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "DevSync",
                description: "Premium Membership",
                image: "https://www.devsync.com/logo.png",
                order_id: orderId,
                notes: notes,
                prefill: {
                    name: `${notes.firstName} ${notes.lastName}`,
                    email: notes.email,
                },
                theme: {
                    color: "#8b5cf6",
                },
                handler: verifyPayment,
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Payment creation failed", err);
            toast.error("Payment initialization failed");
        }
    };

    const displayName = user
        ? `${user.firstName} ${user.lastName}`
        : "Alex Developer";

    return (
        <div className="premium-page">
            <div className="premium-container">
                {/* Header */}
                <div className="premium-header">
                    <div className="premium-header-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                        </svg>
                        Premium
                    </div>
                    <h1>
                        Stand Out on{" "}
                        <span className="premium-gradient-text">DevSync</span>
                    </h1>
                    <p>
                        Upgrade to get a verified badge, priority placement, and
                        exclusive profile features that set you apart.
                    </p>
                </div>

                {/* Already Premium Banner */}
                {isUserPremium && (
                    <div className="premium-active-banner">
                        <div className="premium-active-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                        </div>
                        <div className="premium-active-text">
                            <h3>You're a Premium Member ✨</h3>
                            <p>Enjoy all exclusive features and your verified badge</p>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="premium-card-wrapper">
                    {/* Verified Badge Card */}
                    <div className="premium-card featured">
                        <div className="premium-card-top">
                            <div className="premium-card-icon badge-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="premium-card-title">Verified Badge</h2>
                                <p className="premium-card-desc">
                                    Show the world you're legit
                                </p>
                            </div>
                        </div>

                        <div className="premium-card-price-block">
                            <div className="premium-card-price">
                                <span className="currency">₹</span>99
                                <span className="period">/ lifetime</span>
                            </div>
                            <p className="premium-price-note">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                One-time payment, no subscription
                            </p>
                        </div>

                        <div className="verified-preview">
                            <span className="name">{displayName}</span>
                            <svg
                                className="verified-badge"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>

                        <ul className="premium-features">
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span><strong>Blue Verified</strong> Checkmark</span>
                            </li>
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span>Show legitimacy to connections</span>
                            </li>
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span>Stand out in search results</span>
                            </li>
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span>Priority profile visibility</span>
                            </li>
                        </ul>

                        <div className="premium-card-cta">
                            <button
                                disabled={isUserPremium}
                                className="premium-action-btn primary"
                                onClick={() => handlePurchase("badge")}
                            >
                                {isUserPremium ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Already Verified
                                    </>
                                ) : (
                                    <>
                                        Get Verified Now
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Pro Plan Card */}
                    <div className="premium-card">
                        <div className="premium-card-top">
                            <div className="premium-card-icon pro-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="premium-card-title">DevSync Pro</h2>
                                <p className="premium-card-desc">
                                    The full premium experience
                                </p>
                            </div>
                        </div>

                        <div className="premium-card-price-block">
                            <div className="premium-card-price">
                                <span className="currency">₹</span>249
                                <span className="period">/ month</span>
                            </div>
                            <p className="premium-price-note">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Cancel anytime, no questions asked
                            </p>
                        </div>

                        <ul className="premium-features">
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span><strong>Everything</strong> in Verified Badge</span>
                            </li>
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span>See who requested you</span>
                            </li>
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span><strong>Unlimited</strong> connection requests</span>
                            </li>
                            <li>
                                <span className="feature-icon-wrap">
                                    <CheckIcon />
                                </span>
                                <span><strong>Neon</strong> Profile Border</span>
                            </li>
                        </ul>

                        <div className="premium-card-cta">
                            <button
                                disabled={isUserPremium}
                                className="premium-action-btn secondary"
                                onClick={() => handlePurchase("pro")}
                            >
                                {isUserPremium ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Already Premium
                                    </>
                                ) : (
                                    <>
                                        Subscribe to Pro
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trust Signals */}
                <div className="premium-trust">
                    <div className="trust-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Secure Payment
                    </div>
                    <div className="trust-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        Powered by Razorpay
                    </div>
                    <div className="trust-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                        </svg>
                        Instant Activation
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg
        className="feature-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
        />
    </svg>
);

export default Premium;