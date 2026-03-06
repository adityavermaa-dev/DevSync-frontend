import React from 'react';

const TermsOfService = () => {
    return (
        <div className="container mx-auto p-8 max-w-4xl text-base-content my-10 bg-base-200 rounded-box shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-primary">Terms of Service</h1>
            <p className="mb-4 text-sm text-base-content/70">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p>By accessing or using the DevSync service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
                    <p>DevSync provides a platform for developers to connect, network, and share their skills. We reserve the right to modify or discontinue, temporarily or permanently, the Service with or without notice.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
                    <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    <p className="mt-2">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">4. Content</h2>
                    <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
                    <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of DevSync and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us at support@devsync.com.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
