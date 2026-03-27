import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full py-8 mt-auto backdrop-blur-md bg-white/40 border-t border-white/60 text-gray-600 flex flex-col items-center justify-center gap-4 relative z-10 transition-colors">
            <div className="flex flex-wrap justify-center gap-6 font-semibold text-sm">
                <Link to="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-purple-600 transition-colors">Terms of Service</Link>
                <Link to="/refund" className="hover:text-purple-600 transition-colors">Refund Policy</Link>
                <Link to="/contact" className="hover:text-purple-600 transition-colors">Contact Us</Link>
            </div>
            <p className="text-sm font-medium opacity-80">
                Copyright © {new Date().getFullYear()} - All rights reserved by DevSync Ltd
            </p>
        </footer>
    );
};

export default Footer;
