import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import FloatingParticles from '../components/FloatingParticles';
import { FiHeart, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      let response;

      try {
        response = await API.post('/auth/login', {
          email: trimmedEmail,
          password,
        });
      } catch (firstErr) {
        const invalidCreds =
          firstErr.response?.status === 400 &&
          typeof firstErr.response?.data?.error === 'string' &&
          firstErr.response.data.error.toLowerCase().includes('invalid');

        if (invalidCreds && trimmedEmail !== trimmedEmail.toLowerCase()) {
          response = await API.post('/auth/login', {
            email: trimmedEmail.toLowerCase(),
            password,
          });
        } else {
          throw firstErr;
        }
      }

      const payload = response.data?.data || response.data;
      login(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-bg-circle" />
        <div className="auth-bg-circle" />
        <div className="auth-bg-circle" />
      </div>

      <FloatingParticles />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        }}
      >
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="auth-logo-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FiHeart />
          </motion.div>
          <h1>HealthCare Pro</h1>
          <p>Healthcare Management System</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label>Email Address</label>
            <div className="form-input-icon">
              <FiMail className="icon" />
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label>Password</label>
            <div className="form-input-icon">
              <FiLock className="icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div
                  className="loading-spinner"
                  style={{ width: 20, height: 20, borderWidth: 2 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  Sign In <FiArrowRight />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div
          className="auth-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Don't have an account? <Link to="/register">Sign Up</Link>
        </motion.div>

        <motion.div
          style={{
            marginTop: 16,
            padding: 12,
            background: 'rgba(99,102,241,0.1)',
            borderRadius: 8,
            fontSize: 12,
            color: '#94a3b8'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <strong style={{ color: '#818cf8' }}>Demo Credentials:</strong><br />
          Patient: john.doe@email.com / password123<br />
          Doctor: dr.smith@healthcare.com / password123
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
