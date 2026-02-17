import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiUserCheck, FiAward, FiSearch, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Find Doctors</h1>
        <p>Browse our medical professionals</p>
      </motion.div>

      <motion.div
        style={{ marginBottom: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="form-input-icon" style={{ maxWidth: 400 }}>
          <FiSearch className="icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {filtered.map((doctor, index) => (
          <AnimatedCard
            key={doctor.doctorId}
            delay={index * 0.1}
            className="data-card"
          >
            <div style={{ padding: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 16, marginBottom: 20,
              }}>
                <motion.div
                  style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 26, fontWeight: 700,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {doctor.name?.charAt(0)}
                </motion.div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                    {doctor.name}
                  </h3>
                  <span className="badge badge-doctor">
                    <FiUserCheck style={{ marginRight: 4 }} /> Doctor
                  </span>
                </div>
              </div>

              <div style={{
                padding: 12, background: 'rgba(0,0,0,0.2)',
                borderRadius: 10, fontSize: 13,
                color: '#94a3b8', marginBottom: 16,
              }}>
                <FiAward style={{ marginRight: 8 }} />
                License: <strong style={{ color: '#f8fafc' }}>
                  {doctor.licenseNumber}
                </strong>
              </div>

              <motion.button
                className="btn btn-primary"
                onClick={() => navigate('/messages')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontSize: 13 }}
              >
                <FiMessageSquare /> Send Message
              </motion.button>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default FindDoctors;