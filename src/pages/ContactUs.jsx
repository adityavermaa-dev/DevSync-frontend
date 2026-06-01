import React, { useState } from 'react';
import './Policy.css';

const ContactUs = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        setStatus('Thank you for contacting us! We will get back to you shortly.');
        e.target.reset();

        setTimeout(() => {
            setStatus('');
        }, 5000);
    };

    return (
        <div className="policy-page">
            <div className="policy-container">
                <h1 className="policy-title">Contact Us</h1>
                <p className="policy-date">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="contact-grid mt-8">
                    {}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Get in Touch</h2>
                        <p className="mb-6 text-[var(--text-secondary)]">Have questions about DevSync? We are here to help. Reach out to us through any of the following channels or use the contact form.</p>

                        <div className="space-y-6">

                            <div className="contact-info-item">
                                <span className="contact-icon">✉️</span>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">Email</h3>
                                    <p className="text-[var(--text-secondary)] text-sm mt-1 leading-relaxed">
                                        <a href="mailto:support@devsyncapp.in" className="devsync-link">support@devsyncapp.in</a><br />
                                        <a href="mailto:contact@devsyncapp.in" className="devsync-link">contact@devsyncapp.in</a>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <span className="contact-icon">📞</span>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">Phone</h3>
                                    <p className="text-[var(--text-secondary)] text-sm mt-1 leading-relaxed">
                                        <a href="tel:+916393027647" className="devsync-link">+91 6393027647</a><br />
                                        <span className="text-[var(--text-faint)] text-xs">(Mon-Fri, 9am - 5pm IST)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="contact-form-card">
                        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-primary)]">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group relative">
                                <label className="form-label">Name</label>
                                <input type="text" required placeholder="Your Full Name" className="form-input" />
                            </div>

                            <div className="form-group relative">
                                <label className="form-label">Email</label>
                                <input type="email" required placeholder="your.email@example.com" className="form-input" />
                            </div>

                            <div className="form-group relative">
                                <label className="form-label">Subject</label>
                                <input type="text" required placeholder="How can we help?" className="form-input" />
                            </div>

                            <div className="form-group relative">
                                <label className="form-label">Message</label>
                                <textarea required className="form-textarea" placeholder="Your message..."></textarea>
                            </div>

                            <button type="submit" className="submit-btn w-full">Send Message</button>
                        </form>

                        {status && (
                            <div className="mt-4 p-3 bg-[var(--color-green)] text-[var(--bg-primary)] border border-[var(--color-green)] rounded-md text-center text-sm font-semibold">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
