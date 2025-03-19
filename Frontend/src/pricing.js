import Navbar from "./navbar";
import {useNavigate} from "react-router-dom";
import React, { useState } from "react";
import {useAuth} from "./AuthContext";
import PaymentModal from "./components/payment/PaymentModal";
import "./pricing.css";

function Pricing() {
    const navigate = useNavigate();
    const { user } = useAuth()
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleUpgradeClick = () => {
       /* if (!user) {
            navigate("/login");
            return;
        } */
        setShowPaymentModal(true);
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        // Handle successful payment logic here
        console.log("Payment successful");
    };

    return (
        <div className="pricing-container">
            <Navbar />
            <div className="pricing-header">
                <h1>Choose Your Plan</h1>
                <p>Start with our free plan or upgrade for premium features</p>
            </div>

            <div className="pricing-cards">
                {/* Free Plan */}
                <div className="pricing-card">
                    <div className="card-header">
                        <h2>Free</h2>
                        <div className="price">
                            <span className="currency">pkr</span>
                            <span className="amount">0</span>
                            <span className="period">/month</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <ul className="features">
                            <li>✓ Basic charts</li>
                            <li>✓ Frequent cron job updates</li>
                        </ul>
                        <button 
                            className="subscribe-button"
                            onClick={() => handleUpgradeClick('free')}
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="pricing-card premium">
                    <div className="popular-badge">Most Popular</div>
                    <div className="card-header">
                        <h2>Premium</h2>
                        <div className="price">
                            <span className="currency">pkr</span>
                            <span className="amount">1999</span>
                            <span className="period">/month</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <ul className="features">
                            <li>✓ Advanced charts</li>
                            <li>✓ Upto 3 charts</li>
                            <li>✓ Cron jobs on user request</li>
                        </ul>
                        <button 
                            className="subscribe-button premium-button"
                            onClick={handleUpgradeClick}
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={handleCloseModal}
                    onSuccess={handlePaymentSuccess}
                    plan={{
                        name: 'Premium',
                        price: 1999,
                        currency: 'pkr',
                        period: 'month',
                        features: [
                            'Advanced charts',
                            'Upto 3 charts',
                            'Cron jobs on user request'
                        ]
                    }}
                />
            )}

            <div className="pricing-faq">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h3>Can I change plans later?</h3>
                        <p>Yes, you can upgrade or downgrade your plan at any time.</p>
                    </div>
                    <div className="faq-item">
                        <h3>What payment methods do you accept?</h3>
                        <p>We accept EasyPaisa, JazzCash, and Credit Cards.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Is there a contract?</h3>
                        <p>No, all plans are month-to-month with no long-term commitment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pricing;