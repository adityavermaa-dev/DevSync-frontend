import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL, ENABLE_PREMIUM } from '../constants/commonData';
import { removeUser } from '../redux/userSlice';
import { removeConnections } from '../redux/connectionSlice';
import { removeFeed } from '../redux/feedSlice';
import { removeRequests } from '../redux/requestSlice';
import { removeReels } from '../redux/reelsSlice';
import logo from '../assests/images/logo.png';
import userIcon from '../assests/images/default-user-image.png';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';
import toast from 'react-hot-toast';

const feedIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
);

const connectionsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21 12.36 12.36 0 0 1 2 19.128v-.003c0-1.113.285-2.16.786-3.07M15 19.128V16.06M2.786 16.055A5.61 5.61 0 0 1 5.03 13.5a5.61 5.61 0 0 1 4.941 0 5.61 5.61 0 0 1 2.244 2.555M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
);

const projectsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>
);

const requestsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
);

const reelsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
);

const updatesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
);

const uploadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
);

const premiumIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
);

const chatIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75A6.75 6.75 0 0 1 9 6h6a6.75 6.75 0 0 1 6.75 6.75v.75A6.75 6.75 0 0 1 15 21H9a7.43 7.43 0 0 1-2.813-.548L2.25 21l1.035-3.45A6.73 6.73 0 0 1 2.25 14.25v-1.5Z" /></svg>
);

const logoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
);

const notificationsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
);


const Sidebar = () => {
    const user = useSelector(store => store.user);
    const unreadCount = useSelector(store => store.notifications?.unreadCount || 0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
            dispatch(removeUser());
            dispatch(removeConnections());
            dispatch(removeFeed());
            dispatch(removeRequests());
            dispatch(removeReels());
            toast.success('Signed out');
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error('Logout failed');
        }
    };

    const navLinks = [
        { to: '/', label: 'Feed', icon: feedIcon },
        { to: '/connections', label: 'Matches', icon: connectionsIcon },
        { to: '/projects', label: 'Projects', icon: projectsIcon },
        { to: '/requests', label: 'Requests', icon: requestsIcon },
        { to: '/chat', label: 'Chat', icon: chatIcon },
        { to: '/feed', label: 'Reels', icon: reelsIcon },
        { to: '/updates', label: 'Updates', icon: updatesIcon },
        { to: '/upload', label: 'Upload', icon: uploadIcon },
        { to: '/notifications', label: 'Alerts', icon: notificationsIcon, badge: unreadCount },
        ...(ENABLE_PREMIUM ? [{ to: '/premium', label: 'Premium', icon: premiumIcon }] : []),
    ];

    const isActive = (path) => location.pathname === path;

    const firstName = user?.firstName || 'User';
    const photoUrl = user?.photoUrl || userIcon;

    if (!user) {
        return (
            <div className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
                <Link to="/" className="flex items-center gap-2 text-base-content no-underline w-max pointer-events-auto">
                    <img src={logo} alt="DevSync" className="w-10 h-10 rounded-xl" />
                    <span className="text-2xl font-bold">DevSync</span>
                </Link>
            </div>
        );
    }

    return (
        <aside className="group/sidebar fixed inset-y-0 left-0 z-50 flex flex-col w-[80px] hover:w-[260px] bg-base-100/95 backdrop-blur-xl border-r border-base-200 transition-all duration-300 ease-in-out shadow-[10px_0_32px_rgba(0,0,0,0.05)] hover:shadow-[14px_0_42px_rgba(0,0,0,0.1)] py-4 overflow-y-auto overflow-x-hidden md:bottom-0 bottom-0 max-md:w-full max-md:h-[70px] max-md:flex-row max-md:border-r-0 max-md:border-t max-md:top-auto max-md:hover:w-full max-md:py-0 max-md:justify-around max-md:items-center">
            
            <div className="flex items-center justify-center min-h-[40px] mb-6 px-0 group-hover/sidebar:px-6 group-hover/sidebar:justify-start transition-all duration-300 max-md:hidden">
                <Link to="/" className="flex items-center gap-4 text-base-content no-underline">
                    <img src={logo} alt="DevSync" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-md group-hover/sidebar:scale-105 transition-transform" />
                    <span className="text-2xl font-extrabold tracking-tight whitespace-nowrap opacity-0 hidden group-hover/sidebar:block group-hover/sidebar:opacity-100 transition-opacity delay-75">DevSync</span>
                </Link>
            </div>

            <nav className="flex-1 flex flex-col gap-2 px-2 group-hover/sidebar:px-4 max-md:flex-row max-md:w-full max-md:justify-around max-md:px-2">
                {navLinks.map(({ to, label, icon, badge }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 px-3 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 group/link relative
                                ${active 
                                    ? 'bg-gradient-to-r from-primary to-primary-focus text-primary-content shadow-lg shadow-primary/30 max-md:bg-base-200 max-md:text-primary max-md:shadow-none' 
                                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content max-md:hover:bg-transparent'
                                } max-md:rounded-full max-md:p-2`}
                            title={label}
                        >
                            {active && <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-info rounded-r-md hidden group-hover/sidebar:block"></div>}
                            
                            <div className="relative flex-shrink-0 flex items-center justify-center transition-transform group-hover/link:-translate-y-0.5">
                                {icon}
                                {badge > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-error text-error-content text-[10px] font-bold flex items-center justify-center shadow-sm border border-base-100 animate-bounce">
                                        {badge > 9 ? '9+' : badge}
                                    </span>
                                )}
                            </div>
                            <span className="font-semibold opacity-0 hidden group-hover/sidebar:block group-hover/sidebar:opacity-100 transition-opacity delay-75 max-md:hidden">
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col gap-2 px-2 group-hover/sidebar:px-4 pt-4 max-md:hidden">
                <div className="flex items-center justify-center group-hover/sidebar:justify-start px-2 py-2 rounded-2xl bg-base-200/50 hover:bg-base-200 transition-colors cursor-pointer group/theme">
                    <ThemeToggle className="scale-90" />
                    <span className="font-semibold ml-4 opacity-0 hidden group-hover/sidebar:block group-hover/sidebar:opacity-100 text-base-content/80 group-hover/theme:text-base-content">
                        Theme
                    </span>
                </div>
                
                <div className="h-px bg-base-300 my-2 mx-2"></div>

                <Link to="/profile" className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-3 px-2 py-2 rounded-2xl hover:bg-base-200 transition-colors group/profile">
                    <img src={photoUrl} alt={firstName} className="w-10 h-10 rounded-full object-cover border-2 border-base-300 flex-shrink-0 group-hover/profile:scale-105 transition-transform shadow-sm" />
                    <div className="flex-1 min-w-0 opacity-0 hidden group-hover/sidebar:block group-hover/sidebar:opacity-100">
                        <p className="text-sm font-bold text-base-content truncate leading-tight">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs font-medium text-base-content/60 truncate mt-0.5">{user?.email}</p>
                    </div>
                </Link>

                <button onClick={handleLogout} className="flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-4 px-3 py-3 rounded-2xl text-error hover:bg-error/10 transition-colors group/logout">
                    <div className="flex-shrink-0 group-hover/logout:scale-110 transition-transform">
                        {logoutIcon}
                    </div>
                    <span className="font-bold opacity-0 hidden group-hover/sidebar:block group-hover/sidebar:opacity-100">
                        Sign out
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
