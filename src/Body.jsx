import React, { useEffect } from 'react'
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
    const fetchUser = async () => {
        if (user) {
            return;
        }
        try {
            const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true })
            console.log(res.data);
            dispatch(addUser(res.data));
        } catch (error) {
            if (error.status === 401) {
                navigate("/login")
            }
            console.log(error);
        }
    }

    useEffect(() => {
        fetchUser();
    }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Body
