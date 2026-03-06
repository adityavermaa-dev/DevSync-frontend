import React, { useState } from 'react';

const ContactUs = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would handle the form submission here (e.g., API call)
        setStatus('Thank you for contacting us! We will get back to you shortly.');
        e.target.reset();

        setTimeout(() => {
            setStatus('');
        }, 5000);
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl text-base-content my-10 bg-base-200 rounded-box shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-primary">Contact Us</h1>
            <p className="mb-4 text-sm text-base-content/70">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
                {/* Contact Information */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                    <p className="mb-6">Have questions about DevSync? We are here to help. Reach out to us through any of the following channels or use the contact form.</p>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <span className="text-xl mr-4">📍</span>
                            <div>
                                <h3 className="font-semibold">Registered Address</h3>
                                <p className="text-base-content/80">
                                    DevSync Technologies Inc.<br />
                                    123 Developer Lane, Suite 404<br />
                                    Tech City, TX 75001<br />
                                    United States
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <span className="text-xl mr-4">✉️</span>
                            <div>
                                <h3 className="font-semibold">Email</h3>
                                <p className="text-base-content/80">
                                    <a href="mailto:support@devsync.com" className="link link-hover">support@devsync.com</a><br />
                                    <a href="mailto:billing@devsync.com" className="link link-hover">billing@devsync.com</a>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <span className="text-xl mr-4">📞</span>
                            <div>
                                <h3 className="font-semibold">Phone</h3>
                                <p className="text-base-content/80">
                                    <a href="tel:+15551234567" className="link link-hover">+1 (555) 123-4567</a><br />
                                    <span className="text-xs">(Mon-Fri, 9am - 5pm EST)</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-base-100 p-6 rounded-box shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Name</span>
                            </label>
                            <input type="text" required placeholder="Your Full Name" className="input input-bordered w-full" />
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input type="email" required placeholder="your.email@example.com" className="input input-bordered w-full" />
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Subject</span>
                            </label>
                            <input type="text" required placeholder="How can we help?" className="input input-bordered w-full" />
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Message</span>
                            </label>
                            <textarea required className="textarea textarea-bordered h-24" placeholder="Your message..."></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary w-full text-white">Send Message</button>
                    </form>

                    {status && (
                        <div className="mt-4 p-3 bg-success/20 text-success border border-success rounded-md text-center text-sm">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
