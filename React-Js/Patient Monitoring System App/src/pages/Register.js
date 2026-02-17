import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import FloatingParticles from '../components/FloatingParticles';
import {
  FiHeart, FiMail, FiLock, FiUser,
  FiArrowRight, FiPhone, FiCalendar, FiFileText
} from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'PATIENT',
    dateOfBirth: '',
    contactNumber: '',
    emergencyContact: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        contactNumber: formData.contactNumber.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        licenseNumber: formData.licenseNumber.trim(),
      };

      const response = await API.post('/auth/register', payload);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
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
        style={{ maxWidth: 520 }}
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
      >
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="auth-logo-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FiHeart />
          </motion.div>
          <h1>Create Account</h1>
          <p>Join HealthCare Pro today</p>
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
            <label>Full Name</label>
            <div className="form-input-icon">
              <FiUser className="icon" />
              <input
                type="text"
                className="form-input"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
          >
            <label>Email Address</label>
            <div className="form-input-icon">
              <FiMail className="icon" />
              <input
                type="email"
                className="form-input"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 }}
          >
            <label>Role</label>
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </motion.div>

          <AnimatePresence mode="wait">
            {formData.role === 'PATIENT' && (
              <motion.div
                key="patient-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label>Date of Birth</label>
                  <div className="form-input-icon">
                    <FiCalendar className="icon" />
                    <input
                      type="date"
                      className="form-input"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <div className="form-input-icon">
                    <FiPhone className="icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="contactNumber"
                      placeholder="+1-555-0000"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <div className="form-input-icon">
                    <FiPhone className="icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="emergencyContact"
                      placeholder="+1-555-0000"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {formData.role === 'DOCTOR' && (
              <motion.div
                key="doctor-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label>License Number</label>
                  <div className="form-input-icon">
                    <FiFileText className="icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="licenseNumber"
                      placeholder="MED-2024-XXX"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
                  Create Account <FiArrowRight />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div
          className="auth-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Already have an account? <Link to="/login">Sign In</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
