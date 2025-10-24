// src/components/PaymentSuccess.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, Coins, Home } from 'lucide-react';
import '../styles/Payment.css';

export default function PaymentSuccess({ onBack }) {
  const [confetti, setConfetti] = useState(true);
  const [amount, setAmount] = useState(0);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAmount(params.get('amount'));
    setTokens(params.get('tokens'));
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="payment-success-container">
      {confetti && <div className="confetti-animation"></div>}
      <div className="success-card">
        <div className="success-icon-wrapper">
          <CheckCircle className="success-icon" size={80} />
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">Your tokens have been added to your account</p>

        <div className="purchase-summary-box">
          <div className="summary-item">
            <Coins className="summary-icon" size={32} />
            <div>
              <div className="summary-label">Tokens Purchased</div>
              <div className="summary-value">{tokens}</div>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-item">
            <div className="amount-icon">€</div>
            <div>
              <div className="summary-label">Amount Paid</div>
              <div className="summary-value">€{amount}</div>
            </div>
          </div>
        </div>

        <div className="success-message">
          <p>✨ You're all set! Your tokens are ready to use.</p>
        </div>

        <div className="success-actions">
          <button onClick={onBack} className="btn btn-primary btn-large">
            <Home size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="receipt-info">
          <small>Receipt sent to your email • Transaction ID: {Date.now()}</small>
        </div>
      </div>
    </div>
  );
}
