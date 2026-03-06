import React from 'react';

const RefundPolicy = () => {
    return (
        <div className="container mx-auto p-8 max-w-4xl text-base-content my-10 bg-base-200 rounded-box shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-primary">Refund and Cancellation Policy</h1>
            <p className="mb-4 text-sm text-base-content/70">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-3">1. Cancellation Policy</h2>
                    <p>You may cancel your DevSync premium subscription at any time. Cancellations will take effect at the end of your current billing cycle. You will continue to have access to the premium features until your subscription period expires.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">2. Refund Eligibility</h2>
                    <p>We believe in the value of our service, but we understand that it might not be a perfect fit for everyone. Therefore, we offer a 7-day money-back guarantee for initial purchases.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                        <li><strong>Initial Purchases:</strong> If you are completely dissatisfied with your purchase, you may request a full refund within 7 days of your initial transaction.</li>
                        <li><strong>Renewals:</strong> Subscriptions renew automatically. We do not provide refunds or credits for partial subscription periods or unused services after the renewal date.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">3. How to Request a Refund</h2>
                    <p>To request a refund within the eligible 7-day period, please contact our support team at <a href="mailto:support@devsync.com" className="link link-primary">support@devsync.com</a> with your account details and the reason for your request. Refunds are processed back to the original payment method and may take 5-10 business days to appear on your statement.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">4. Exceptional Circumstances</h2>
                    <p>In cases of accidental duplicate charges or technical issues that prevent you from using the service, we may, at our sole discretion, issue a refund or credit beyond the standard 7-day window. Please contact support immediately if you experience such issues.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">5. Contact Us</h2>
                    <p>If you have any questions about this Refund and Cancellation Policy, please contact us at <a href="mailto:support@devsync.com" className="link link-primary">support@devsync.com</a>.</p>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicy;
