import React, { useState } from "react";
import { Calendar, LogIn } from "lucide-react";
import "../styles/Auth.css";

export default function LoginView({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await onLogin({ email, password, isAdmin });
    setLoading(false);
    if (!success) setError("Invalid credentials or role");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <Calendar className="icon-large" />
          <h1>Kine Katy</h1>
          <p>Login to manage or book classes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              disabled={loading}
            />
            <label>Login as Administrator</label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="login-loading">
                <span className="spinner" /> Logging in...
              </span>
            ) : (
              <><LogIn className="icon-small" /> Login</>
            )}
          </button>
        </form>

        <div className="switch-auth">
          <button onClick={onSwitchToRegister}>
            Don&#x27;t have an account? Register here
          </button>
        </div>
      </div>
    </div>
  );
}
