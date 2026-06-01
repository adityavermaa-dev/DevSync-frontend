import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ThemeProvider = ({ children }) => {
    const theme = useSelector(store => store.theme);

    useEffect(() => {
        
        document.documentElement.setAttribute('data-theme', theme);
        
        
        document.body.className = `${theme}-theme`;
    }, [theme]);

    return (
        <>
            {children}
        </>
    );
};

export default ThemeProvider;
