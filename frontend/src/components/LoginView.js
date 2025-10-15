import React, { useState } from 'react';
import { Calendar, LogIn } from 'lucide-react';
import '../styles/Auth.css';


export default function LoginView({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin({ email, password, isAdmin });
    if (!success) setError('Invalid credentials or role');

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Login failed')
      return;

      // Pass token and user to parent
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <Calendar className="icon-large" />
          <h1>Class Booking System</h1>
          <p>Login to manage or book classes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label>Login as Administrator</label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary">
            <LogIn className="icon-small" /> Login
          </button>
        </form>

        <div className="switch-auth">
          <button onClick={onSwitchToRegister}>
            Don’t have an account? Register here
          </button>
        </div>
      </div>
    </div>
  );
}