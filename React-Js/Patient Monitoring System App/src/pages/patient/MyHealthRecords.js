import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiActivity, FiThermometer, FiWind } from 'react-icons/fi';

const MyHealthRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get(`/health-records/patient/${user.userId}`);
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
    // eslint-disable-next-line
  }, []);

  if (loading) return <LoadingSpinner />;

  const getColor = (type, value) => {
    if (type === 'bp' && value > 140) return '#ef4444';
    if (type === 'bp' && value > 130) return '#f59e0b';
    if (type === 'o2' && value < 95) return '#ef4444';
    if (type === 'temp' && value > 100.4) return '#ef4444';
    if (type === 'temp' && value > 99.5) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>My Health Records</h1>
        <p>Track your vitals and health data over time</p>
      </motion.div>

      {records.length === 0 ? (
        <div className="empty-state">
          <motion.div
            className="empty-state-icon"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💓
          </motion.div>
          <h3>No health records yet</h3>
          <p>Your health records will appear here after your visits</p>
        </div>
      ) : (
        records.map((record, index) => (
          <AnimatedCard
            key={record.recordId}
            delay={index * 0.1}
            className="data-card"
          >
            <div style={{ padding: 24 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  Health Check - {record.date}
                </h3>
                <motion.div
                  style={{ fontSize: 24 }}
                  animate={{ scale: [1, 1.2, 1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ❤️
                </motion.div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
              }}>
                <motion.div
                  style={{
                    padding: 20, background: 'rgba(0,0,0,0.2)',
                    borderRadius: 14, textAlign: 'center',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiActivity style={{
                    fontSize: 28, marginBottom: 8,
                    color: getColor('bp', record.bloodPressureSystolic),
                  }} />
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Blood Pressure</div>
                  <div style={{
                    fontSize: 24, fontWeight: 800,
                    color: getColor('bp', record.bloodPressureSystolic),
                  }}>
                    {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>mmHg</div>
                </motion.div>

                <motion.div
                  style={{
                    padding: 20, background: 'rgba(0,0,0,0.2)',
                    borderRadius: 14, textAlign: 'center',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiWind style={{
                    fontSize: 28, marginBottom: 8,
                    color: getColor('o2', record.oxygenLevel),
                  }} />
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Oxygen Level</div>
                  <div style={{
                    fontSize: 24, fontWeight: 800,
                    color: getColor('o2', record.oxygenLevel),
                  }}>
                    {record.oxygenLevel}%
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>SpO2</div>
                </motion.div>

                <motion.div
                  style={{
                    padding: 20, background: 'rgba(0,0,0,0.2)',
                    borderRadius: 14, textAlign: 'center',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiThermometer style={{
                    fontSize: 28, marginBottom: 8,
                    color: getColor('temp', record.temperature),
                  }} />
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Temperature</div>
                  <div style={{
                    fontSize: 24, fontWeight: 800,
                    color: getColor('temp', record.temperature),
                  }}>
                    {record.temperature}°F
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Fahrenheit</div>
                </motion.div>
              </div>

              {record.notes && (
                <div style={{
                  marginTop: 16, padding: 14,
                  background: 'rgba(99,102,241,0.05)',
                  borderRadius: 12, fontSize: 14,
                  color: '#94a3b8', lineHeight: 1.6,
                }}>
                  📝 <strong>Doctor's Notes:</strong> {record.notes}
                </div>
              )}
            </div>
          </AnimatedCard>
        ))
      )}
    </div>
  );
};

export default MyHealthRecords;