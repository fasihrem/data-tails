import React from 'react';
import creditCardIcon from '../../icons/credit-card-icon.png';
import easypaisaIcon from '../../icons/easypaisa-icon.png';
import jazzcashIcon from '../../icons/jazzcash-icon.png';
import './PaymentModal.css';

function PaymentModal({ isOpen, onClose, onSelectPayment, isProcessing }) {
    if (!isOpen) return null;

    const handlePaymentSelect = (method) => {
        if (!isProcessing) {
            onSelectPayment(method);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Payment Method</h2>
                    {!isProcessing && (
                        <button className="close-button" onClick={onClose}>×</button>
                    )}
                </div>
                
                <div className="payment-methods">
                    <button 
                        className={`payment-option ${isProcessing ? 'disabled' : ''}`}
                        onClick={() => handlePaymentSelect('credit-card')}
                        disabled={isProcessing}
                    >
                        <img src={creditCardIcon} alt="Credit Card" />
                        <span>Credit Card</span>
                    </button>

                    <button 
                        className={`payment-option ${isProcessing ? 'disabled' : ''}`}
                        onClick={() => handlePaymentSelect('easypaisa')}
                        disabled={isProcessing}
                    >
                        <img src={easypaisaIcon} alt="Easypaisa" />
                        <span>Easypaisa</span>
                    </button>

                    <button 
                        className={`payment-option ${isProcessing ? 'disabled' : ''}`}
                        onClick={() => handlePaymentSelect('jazzcash')}
                        disabled={isProcessing}
                    >
                        <img src={jazzcashIcon} alt="JazzCash" />
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