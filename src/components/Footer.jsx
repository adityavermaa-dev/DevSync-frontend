import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
            <aside>
                <p>Copyright © {new Date().getFullYear()} - All right reserved by DevSync Ltd</p>
            </aside>
            <nav className="grid-flow-col gap-4">
                <Link to="/privacy" className="link link-hover">Privacy Policy</Link>
                <Link to="/terms" className="link link-hover">Terms of Service</Link>
                <Link to="/refund" className="link link-hover">Refund Policy</Link>
                <Link to="/contact" className="link link-hover">Contact Us</Link>
            </nav>
        </footer>
    );
};

export default Footer;
