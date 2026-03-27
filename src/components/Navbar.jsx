import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { removeUser } from '../redux/userSlice';
import { removeConnections } from '../redux/connectionSlice';
import { removeFeed } from '../redux/feedSlice';
import { removeRequests } from '../redux/requestSlice';
import { removeReels } from '../redux/reelsSlice';
import logo from '../assests/images/logo.png';
import userIcon from '../assests/images/default-user-image.png';
import './Navbar.css';
import toast from 'react-hot-toast';

const Navbar = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Scroll listener for collapsing/elevating navbar
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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
        { to: '/requests', label: 'Requests', icon: requestsIcon },
        { to: '/chat', label: 'Chat', icon: chatIcon },
        { to: '/feed', label: 'Reels', icon: reelsIcon },
        { to: '/upload', label: 'Upload', icon: uploadIcon },
        { to: '/premium', label: 'Premium', icon: premiumIcon },
    ];

    const isActive = (path) => location.pathname === path;

    const firstName = user?.firstName || 'User';
    const photoUrl = user?.photoUrl || userIcon;

    return (
        <>
            <div className="fixed top-0 left-0 w-full flex justify-center z-50 px-4 pt-4 pointer-events-none">
                <nav className={`app-navbar pointer-events-auto ${scrolled ? 'nav-scrolled' : ''}`}>
                    
                    {/* Logo */}
                    <Link to="/" className="nav-brand">
                        <img src={logo} alt="DevSync" className="nav-logo-img" />
                        <span className="nav-brand-text hidden sm:inline-block">DevSync</span>
                    </Link>

                    {/* Center nav links – desktop */}
                    {user && (
                        <div className="nav-main-pill hidden md:flex">
                            {navLinks.map(({ to, label, icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`nav-pill-item ${isActive(to) ? 'active' : ''}`}
                                    title={label}
                                >
                                    <span className="nav-icon-wrap">{icon}</span>
                                    <span className="nav-label-hidden xl:inline-block ml-1.5 font-medium">{label}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="nav-actions flex items-center gap-3">
                        {user && (
                            <>
                                {/* Avatar dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(prev => !prev)}
                                        className="nav-avatar-btn focus:outline-none"
                                    >
                                        <img src={photoUrl} alt={firstName} className="nav-avatar-img" />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="nav-dropdown-menu">
                                            {/* User info header */}
                                            <div className="nav-dropdown-header">
                                                <p className="nav-dropdown-name">{user?.firstName} {user?.lastName}</p>
                                                <p className="nav-dropdown-email">{user?.email}</p>
                                            </div>
                                            <div className="nav-divider" />
                                            <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                {profileIcon} Profile
                                            </Link>
                                            <div className="nav-divider" />
                                            <button onClick={handleLogout} className="nav-dropdown-item danger">
                                                {logoutIcon} Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile hamburger */}
                                <div className={`nav-hamburger md:hidden ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(prev => !prev)}>
                                    <span /><span /><span />
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            {/* Spacer */}
            <div className="h-24 sm:h-28" />

            {/* Mobile drawer */}
            {user && (
                <>
                    <div className={`nav-mobile-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />
                    <div className={`nav-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="nav-avatar-btn">
                                <img src={photoUrl} alt={firstName} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <div className="nav-divider" />

                        <div className="flex flex-col gap-1 my-4">
                            {navLinks.map(({ to, label, icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`mobile-nav-item ${isActive(to) ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span className="w-5 h-5">{icon}</span>
                                    {label}
                                </Link>
                            ))}
                            <Link to="/profile" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                                {profileIcon} Profile
                            </Link>
                        </div>
                        
                        <div className="mt-auto">
                            <div className="nav-divider" />
                            <button onClick={handleLogout} className="mobile-nav-item danger text-red-500 w-full justify-start mt-2">
                                {logoutIcon} Sign out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

/* ── Inline SVG icons ── */
const feedIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
);

const connectionsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21 12.36 12.36 0 0 1 2 19.128v-.003c0-1.113.285-2.16.786-3.07M15 19.128V16.06M2.786 16.055A5.61 5.61 0 0 1 5.03 13.5a5.61 5.61 0 0 1 4.941 0 5.61 5.61 0 0 1 2.244 2.555M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
);

const requestsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
);

const reelsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
);

const uploadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
);

const premiumIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
);

const chatIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75A6.75 6.75 0 0 1 9 6h6a6.75 6.75 0 0 1 6.75 6.75v.75A6.75 6.75 0 0 1 15 21H9a7.43 7.43 0 0 1-2.813-.548L2.25 21l1.035-3.45A6.73 6.73 0 0 1 2.25 14.25v-1.5Z" /></svg>
);

const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
);

const logoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
);

export default Navbar;
