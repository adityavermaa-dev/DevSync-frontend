import React, { useEffect, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from './constants/commonData'
import { useDispatch, useSelector } from 'react-redux'
import { addUser } from './redux/userSlice'

const Body = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(store => store.user)

    useEffect(() => {
        if (user && location.pathname !== '/onboarding') {
            const hasNoSkills = !user.skills || user.skills.length === 0;
            if (hasNoSkills) {
                navigate('/onboarding');
            }
        }
    }, [user, navigate, location.pathname]);


    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
        } catch (error) {
            if (error?.response?.status === 401) {
                navigate("/login")
            }
            console.log(error);
        }
    }, [dispatch, navigate, user])

    useEffect(() => {
        fetchUser();
    }, [fetchUser])

    const isOnboarding = location.pathname === '/onboarding';

    return (
        <div 
            className="landing-page flex flex-col min-h-screen relative"
            onMouseMove={handleMouseMove}
            style={{ 
                '--mx': `${mousePos.x}px`, 
                '--my': `${mousePos.y}px`,
                position: 'relative',
                minHeight: '100vh',
                overflowX: 'hidden'
            }}
        >
            <div className="landing-bg-circle circle-blue" />
            <div className="landing-bg-circle circle-pink" />
            <div className="landing-bg-circle circle-yellow" />

            {!isOnboarding && <Sidebar />}
            <div className={`relative z-10 flex flex-col min-h-screen w-full transition-all duration-300 ${user && !isOnboarding ? 'md:pl-20' : ''}`}>
                <main className={`grow w-full pt-4 px-4 ${user && !isOnboarding ? 'pb-24 md:pb-6' : ''}`}>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default Body
