import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';

const ThemeToggle = ({ className }) => {
    const dispatch = useDispatch();
    const theme = useSelector(store => store.theme);

    const handleToggle = () => {
        dispatch(toggleTheme());
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center justify-center rounded-full transition-all duration-300 ${className}`}
            aria-label="Toggle Theme"
            style={{
                width: '40px',
                height: '40px',
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`,
                boxShadow: theme === 'light' ? '0 4px 10px rgba(0,0,0,0.05)' : '0 4px 10px rgba(0,0,0,0.3)',
                color: theme === 'light' ? '#f59e0b' : '#60a5fa'
            }}
        >
            {theme === 'light' ? (
                
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
