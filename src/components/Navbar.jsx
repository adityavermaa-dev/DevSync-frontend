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
    const [theme, setTheme] = useState(() => localStorage.getItem('devSync-theme') || 'dark');
    const dropdownRef = useRef(null);

    // Apply theme on mount and when it changes
    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('devSync-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Scroll listener for glass effect
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
        { to: '/connections', label: 'Connections', icon: connectionsIcon },
        { to: '/requests', label: 'Requests', icon: requestsIcon },
        { to: '/feed', label: 'Reels', icon: reelsIcon },
        { to: '/upload', label: 'Upload', icon: uploadIcon },
        { to: '/premium', label: 'Premium', icon: premiumIcon },
    ];

    const isActive = (path) => location.pathname === path;

    const firstName = user?.firstName || 'User';
    const photoUrl = user?.photoUrl || userIcon;

    return (
        <>
            <nav className={`navbar-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src={logo} alt="DevSync" className="w-9 h-9 rounded-lg" />
                        <span className="navbar-logo-text text-xl font-bold tracking-tight">DevSync</span>
                    </Link>

                    {/* Center nav links – desktop */}
                    {user && (
                        <div className="navbar-desktop-links hidden md:flex items-center gap-1">
                            {navLinks.map(({ to, label, icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`navbar-link flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm ${isActive(to) ? 'active' : ''}`}
                                >
                                    <span className="w-4 h-4 opacity-70">{icon}</span>
                                    {label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <>
                                <span className="navbar-welcome-badge hidden sm:inline-block">
                                    👋 Hey, {firstName}
                                </span>

                                {/* Theme toggle */}
                                <button
                                    className="navbar-theme-toggle"
                                    onClick={toggleTheme}
                                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                >
                                    {theme === 'dark' ? sunIcon : moonIcon}
                                </button>

                                {/* Avatar dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(prev => !prev)}
                                        className="navbar-avatar-ring cursor-pointer focus:outline-none"
                                    >
                                        <img
                                            src={photoUrl}
                                            alt={firstName}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="navbar-dropdown absolute right-0 mt-3 w-56 rounded-2xl p-2">
                                            {/* User info header */}
                                            <div className="px-3 py-2 mb-1">
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                                            </div>

                                            <div className="navbar-dropdown-divider" />

                                            <Link
                                                to="/profile"
                                                className="navbar-dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                {profileIcon}
                                                Profile
                                            </Link>

                                            <div className="navbar-dropdown-divider" />

                                            <button
                                                onClick={handleLogout}
                                                className="navbar-dropdown-item danger w-full"
                                            >
                                                {logoutIcon}
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile hamburger */}
                                <div
                                    className={`navbar-hamburger ${mobileOpen ? 'open' : ''}`}
                                    onClick={() => setMobileOpen(prev => !prev)}
                                >
                                    <span /><span /><span />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Spacer so content doesn't hide behind fixed navbar */}
            <div className="h-16" />

            {/* Mobile drawer */}
            {user && (
                <>
                    <div
                        className={`navbar-mobile-overlay ${mobileOpen ? 'visible' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className={`navbar-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
                        {/* User info */}
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="navbar-avatar-ring">
                                <img src={photoUrl} alt={firstName} className="w-10 h-10 rounded-full object-cover" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                            </div>
                        </div>

                        <div className="navbar-dropdown-divider" />

                        {navLinks.map(({ to, label, icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`navbar-dropdown-item ${isActive(to) ? '' : ''}`}
                                style={isActive(to) ? { color: '#FD267A' } : {}}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="w-4 h-4">{icon}</span>
                                {label}
                            </Link>
                        ))}

                        <Link
                            to="/profile"
                            className="navbar-dropdown-item"
                            onClick={() => setMobileOpen(false)}
                        >
                            {profileIcon}
                            Profile
                        </Link>

                        <div className="mt-auto">
                            <div className="navbar-dropdown-divider" />
                            <button onClick={toggleTheme} className="navbar-dropdown-item w-full">
                                <span className="w-4 h-4">{theme === 'dark' ? sunIcon : moonIcon}</span>
                                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                            </button>
                            <button onClick={handleLogout} className="navbar-dropdown-item danger w-full">
                                {logoutIcon}
                                Sign out
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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const connectionsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21 12.36 12.36 0 0 1 2 19.128v-.003c0-1.113.285-2.16.786-3.07M15 19.128V16.06M2.786 16.055A5.61 5.61 0 0 1 5.03 13.5a5.61 5.61 0 0 1 4.941 0 5.61 5.61 0 0 1 2.244 2.555M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);

const requestsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const reelsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const uploadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const logoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const sunIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const moonIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const premiumIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
);

export default Navbar;

