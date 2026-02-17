import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="loading-container">
    <motion.div
      className="loading-spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

export default LoadingSpinner;