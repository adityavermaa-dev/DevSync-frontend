import React, { useEffect, useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from './constants/commonData'
import { useDispatch, useSelector } from 'react-redux'
import { addUser } from './redux/userSlice'

const PENDING_OAUTH_KEY = 'devsync-pending-oauth';

const Body = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(store => store.user)
    const fetchUserRef = useRef(null);

    useEffect(() => {
        if (user && location.pathname !== '/onboarding') {
            const hasNoSkills = !user.skills || user.skills.length === 0;
            if (hasNoSkills) {
                navigate('/onboarding');
            }
        }
    }, [user, navigate, location.pathname]);


    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const authRetryCountRef = useRef(0);
    const handleMouseMove = useCallback((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        setMousePos({ x, y });
    }, []);

    const fetchUser = useCallback(async () => {
        if (user) {
            return;
        }

        try {
            const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true })
            dispatch(addUser(res.data));
            authRetryCountRef.current = 0;
            window.sessionStorage.removeItem(PENDING_OAUTH_KEY);
            
            if (window.name === "devsync-github-auth") {
                const authChannel = new BroadcastChannel("devsync-auth");
                authChannel.postMessage({ type: "LOGIN_SUCCESS" });
                authChannel.close();
                window.close();
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                const isPendingOAuth = window.sessionStorage.getItem(PENDING_OAUTH_KEY) === 'github';

                if (isPendingOAuth && authRetryCountRef.current < 6) {
                    authRetryCountRef.current += 1;
                    window.setTimeout(() => {
                        fetchUserRef.current?.();
                    }, 500);
                    return;
                }

                authRetryCountRef.current = 0;
                window.sessionStorage.removeItem(PENDING_OAUTH_KEY);
                navigate("/login")
            }
            console.log(error);
        }
    }, [dispatch, navigate, user])

    useEffect(() => {
        fetchUserRef.current = fetchUser;
    }, [fetchUser]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser])

    const isOnboarding = location.pathname === '/onboarding';

    return (
        <>
            {!isOnboarding && <Sidebar />}
            <div 
                className="landing-page flex flex-col min-h-screen relative"
                onMouseMove={handleMouseMove}
                style={{ 
                    '--mx': `${mousePos.x}px`, 
                    '--my': `${mousePos.y}px`
                }}
            >
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                    <div className="landing-bg-circle circle-blue" />
                    <div className="landing-bg-circle circle-pink" />
                    <div className="landing-bg-circle circle-yellow" />
                </div>

                <div className={`relative z-10 flex flex-col grow w-full transition-all duration-300 ${user && !isOnboarding ? 'md:pl-20' : ''}`}>
                    <main className={`grow w-full pt-4 px-4 ${user && !isOnboarding ? 'pb-0 md:pb-0' : ''}`}>
                        <Outlet />
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    )
}

export default Body
