import React, { useEffect, useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from './constants/commonData'
import { useDispatch, useSelector } from 'react-redux'
import { addUser } from './redux/userSlice'

const Body = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(store => store.user)

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMove = useCallback((e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        setMousePos({ x, y });
    }, []);

    const fetchUser = async () => {
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
    }

    useEffect(() => {
        fetchUser();
    }, [])

    return (
        <div 
            className="landing-page light-theme flex flex-col min-h-screen relative"
            onMouseMove={handleMouseMove}
            style={{ 
                '--mx': `${mousePos.x}px`, 
                '--my': `${mousePos.y}px`,
                position: 'relative',
                height: '100vh',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}
        >
            <div className="landing-bg-circle circle-blue" />
            <div className="landing-bg-circle circle-pink" />
            <div className="landing-bg-circle circle-yellow" />

            <div className="relative z-10 flex flex-col min-h-screen w-full">
                <Navbar />
                <main className="flex-grow w-full">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default Body
