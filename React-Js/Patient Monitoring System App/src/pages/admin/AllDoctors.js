import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiUserCheck, FiAward } from 'react-icons/fi';

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>All Doctors (Admin)</h1>
        <p>Manage all registered doctors</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {doctors.map((doc, i) => (
          <AnimatedCard key={doc.doctorId} delay={i * 0.1} className="data-card">
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <motion.div
                  style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 24, fontWeight: 700,
                  }}
                  whileHover={{ scale: 1.1 }}
                >{doc.name?.charAt(0)}</motion.div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{doc.name}</h3>
                  <span className="badge badge-doctor"><FiUserCheck style={{ marginRight: 4 }} /> Doctor</span>
                </div>
              </div>
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, fontSize: 13, color: '#94a3b8' }}>
                <FiAward style={{ marginRight: 8 }} />License: <strong style={{ color: '#f8fafc' }}>{doc.licenseNumber}</strong>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default AllDoctors;