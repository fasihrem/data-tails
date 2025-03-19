import React, { useState } from 'react';
import creditCardIcon from '../../icons/credit-card-icon.png';
import easypaisaIcon from '../../icons/easypaisa-icon.png';
import jazzcashIcon from '../../icons/jazzcash-icon.png';
import './PaymentModal.css';

function PaymentModal({ isOpen, onClose, onSuccess, plan }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePaymentSelect = async (method) => {
        if (isProcessing) return;
        setSelectedMethod(method);
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Complete Your Purchase</h2>
                    {!isProcessing && (
                        <button className="close-button" onClick={onClose}>×</button>
                    )}
                </div>

                <div className="plan-summary">
                    <h3>{plan.name} Plan</h3>
                    <p className="price">
                        {plan.currency.toUpperCase()} {plan.price}/{plan.period}
                    </p>
                    <ul className="features-list">
                        {plan.features.map((feature, index) => (
                            <li key={index}>✓ {feature}</li>
                        ))}
                    </ul>
                </div>
                
                <div className="payment-methods">
                    <button 
                        className={`payment-option ${selectedMethod === 'credit-card' ? 'selected' : ''} ${isProcessing ? 'disabled' : ''}`}
                        onClick={() => handlePaymentSelect('credit-card')}
                        disabled={isProcessing}
                    >
                        <img src={creditCardIcon} alt="Credit Card" className="payment-icon" />
                        <span>Credit Card</span>
                    </button>

                    <button 
                        className={`payment-option ${selectedMethod === 'easypaisa' ? 'selected' : ''} ${isProcessing ? 'disabled' : ''}`}
                        onClick={() => handlePaymentSelect('easypaisa')}
                        disabled={isProcessing}
                    >
                        <img src={easypaisaIcon} alt="Easypaisa" className="payment-icon" />
                        <span>Easypaisa</span>
                    </button>

                    <button 
                        className={`payment-option ${selectedMethod === 'jazzcash' ? 'selected' : ''} ${isProcessing ? 'disabled' : ''}`}
                        onClick={() => handlePaymentSelect('jazzcash')}
                        disabled={isProcessing}
                    >
                        <img src={jazzcashIcon} alt="JazzCash" className="payment-icon" />
                        <span>JazzCash</span>
                    </button>
                </div>

                {isProcessing && (
                    <div className="processing-overlay">
                        <div className="spinner"></div>
                        <p>Processing payment...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentModal; 