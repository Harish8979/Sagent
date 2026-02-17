import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      delay,
      duration: 0.5,
      type: 'spring',
      stiffness: 100,
    }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;