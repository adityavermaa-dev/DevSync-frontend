import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { addUser } from "../redux/userSlice";
import { BASE_URL } from "../constants/commonData";

const AuthCallback = ({ provider = "Authentication" }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        let isMounted = true;

        const completeAuth = async () => {
            const hasError = searchParams.get("error");
            const tokenParam = searchParams.get("token");

            if (hasError) {
                if (!isMounted) return;

                toast.error(`${provider} login failed. Please try again.`);
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage("devsync_github_auth_error", window.location.origin);
                    setTimeout(() => window.close(), 300);
                    return;
                }
                navigate("/login", { replace: true, state: { openModal: true } });
                return;
            }

            if (tokenParam) {
                document.cookie = `token=${tokenParam}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, "", cleanUrl);
            }

            try {
                const profileRes = await axios.get(`${BASE_URL}/profile/view`, {
                    withCredentials: true,
                });

                if (!isMounted) return;

                dispatch(addUser(profileRes.data));
                toast.success(`${provider} login successful.`);

                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage("devsync_github_auth_success", window.location.origin);
                    setTimeout(() => window.close(), 200);
                    return;
                }

                if (window.name === "devsync-github-auth") {
                    setTimeout(() => window.close(), 200);
                    return;
                }

                navigate("/", { replace: true });
            } catch {
                if (!isMounted) return;

                toast.error(`${provider} login could not be completed. Please try again.`);

                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage("devsync_github_auth_error", window.location.origin);
                    setTimeout(() => window.close(), 500);
                    return;
                }

                navigate("/login", { replace: true, state: { openModal: true } });
            }
        };

        completeAuth();

        return () => {
            isMounted = false;
        };
    }, [dispatch, navigate, provider, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-6 dark:bg-[#0D0D12]">
            <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#15151d]">
                <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Finishing {provider} sign-in
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    We're checking your session and taking you back into DevSync.
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
