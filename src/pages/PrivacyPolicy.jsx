import React from 'react';
import './Policy.css'; 

const PrivacyPolicy = () => {
    return (
        <div className="policy-page">
            <div className="policy-container">
                <h1 className="policy-title">Privacy Policy</h1>
                <p className="policy-date">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="policy-content">
                    <section>
                        <h2>1. Information We Collect</h2>
                        <p>We collect information that you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested, and other information you choose to provide.</p>
                    </section>

                    <section>
                        <h2>2. How We Use Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
                        <ul>
                            <li>Facilitate interactions between users.</li>
                            <li>Send updates, security alerts, and support messages.</li>
                            <li>Process transactions and send related information.</li>
                            <li>Respond to your comments, questions, and requests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Sharing of Information</h2>
                        <p>We may share the information we collect about you as described in this policy or as described at the time of collection or sharing, including as follows:</p>
                        <ul>
                            <li>With third-party vendors and other service providers.</li>
                            <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process.</li>
                            <li>If we believe your actions are inconsistent with our user agreements or policies.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Security</h2>
                        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                    </section>

                    <section>
                        <h2>5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at support@devsync.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
