import React from 'react';
import { motion } from 'framer-motion';

const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 4,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `hsl(${230 + Math.random() * 30}, 80%, 65%)`,
          }}
          initial={{ y: '100vh', opacity: 0, scale: 0 }}
          animate={{
            y: '-100px',
            opacity: [0, 0.6, 0.6, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;