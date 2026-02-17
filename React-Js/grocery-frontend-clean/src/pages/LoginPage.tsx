import { useState } from "react";
import { login as authLogin } from "../services/authService";
import "../styles/login.css";

export default function LoginPage({ onLogin, goToRegister }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    
    // Validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    const result = await authLogin(name, email);
    setLoading(false);
    
    if (result.success) {
      onLogin();
    } else {
      setError(result.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      {/* Left side - Welcome Section */}
      <div className="login-left">
        <div className="welcome-content">
          <div className="chef-icon">🛒</div>
          <h1 className="welcome-title">Grocery Delivery App</h1>
          <p className="welcome-subtitle">Shop Your Daily Necessities - Fast & Fresh Delivery</p>
          <div className="vegetables-icons">
            <span>🛍️</span>
            <span>🥛</span>
            <span>🍚</span>
            <span>🧴</span>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <h2 className="login-title">Welcome back!</h2>
          <p className="login-subtitle">Login to start shopping!</p>

          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="signup-text">
            Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); if (goToRegister) goToRegister(); }}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
