import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { addUser } from "../redux/userSlice";
import { BASE_URL } from "../constants/commonData";

const AuthCallback = ({ provider = "Authentication" }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const completeAuth = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const isError = urlParams.get("error");

                // Notify the opener / parent tab via BroadcastChannel (for same-origin fallback)
                const authChannel = new BroadcastChannel("devsync-auth");
                
                if (isError) {
                    authChannel.postMessage({ type: "LOGIN_ERROR" });
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage("devsync_github_auth_error", "*");
                    }
                    toast.error(`${provider} login failed or was cancelled.`);
                } else {
                    authChannel.postMessage({ type: "LOGIN_SUCCESS" });
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage("devsync_github_auth_success", "*");
                    }
                }
                authChannel.close();

                // Close popup
                if (window.opener && !window.opener.closed) {
                    window.close();
                    return;
                }
                if (window.name === "devsync_github_auth" || window.name === "devsync-github-auth") {
                    window.close();
                    return;
                }

                // Fallback: not a popup, navigate to home or login
                if (isError) {
                    navigate("/login", { replace: true });
                } else {
                    // Only fetch profile if we are the main window
                    const profileRes = await axios.get(`${BASE_URL}/profile/view`, {
                        withCredentials: true,
                    });
                    if (isMounted) {
                        dispatch(addUser(profileRes.data));
                        toast.success(`${provider} login successful.`);
                        navigate("/", { replace: true });
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                toast.error(`${provider} login could not be completed.`);
                navigate("/login", { replace: true });
            }
        };

        completeAuth();

        return () => {
            isMounted = false;
        };
    }, [dispatch, navigate, provider]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-6 dark:bg-[#0D0D12]">
            <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#15151d]">
                <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Finishing {provider} sign-in
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    We&apos;re checking your session and taking you back into DevSync.
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
