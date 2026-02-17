import { useState } from "react";
import { createUser } from "../services/userService";
import "../styles/login.css";

export default function RegisterPage({ onRegister, goToLogin }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess(false);
    
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
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }
    
    setLoading(true);
    
    try {
      const newUser = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        status: "ACTIVE",
        address: ""
      };
      
      const result = await createUser(newUser);
      
      if (result) {
        setSuccess(true);
        setError("");
        
        // Store user info in localStorage
        localStorage.setItem("userId", result.userId.toString());
        localStorage.setItem("userName", result.name);
        localStorage.setItem("userEmail", result.email);
        localStorage.setItem("userPhone", result.phoneNumber || "");
        
        // Redirect to products page after 1.5 seconds
        setTimeout(() => {
          onRegister();
        }, 1500);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
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

      {/* Right side - Registration Form */}
      <div className="login-right">
        <div className="login-form-container">
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Register to start shopping!</p>

          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
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
              onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ Registration successful! Redirecting...
            </div>
          )}

          <button
            className="login-button"
            onClick={handleRegister}
            disabled={loading || success}
          >
            {loading ? "Creating Account..." : success ? "Success!" : "Create Account"}
          </button>

          <p className="signup-text">
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); goToLogin(); }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
