import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiBookOpen, FiCalendar } from 'react-icons/fi';

const MyMedicalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/medical-history/patient/${user.userId}`);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Medical History</h1>
        <p>Your diagnosed conditions and medical background</p>
      </motion.div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No medical history recorded</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 20,
        }}>
          {history.map((item, index) => (
            <AnimatedCard
              key={item.historyId}
              delay={index * 0.1}
              className="data-card"
            >
              <div style={{ padding: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 14, marginBottom: 16,
                }}>
                  <motion.div
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22,
                    }}
                    whileHover={{ rotate: 10 }}
                  >
                    <FiBookOpen />
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                      {item.condition}
                    </h3>
                    <div style={{
                      fontSize: 12, color: '#94a3b8',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <FiCalendar size={12} />
                      Diagnosed: {item.diagnosisDate}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: 14, background: 'rgba(0,0,0,0.2)',
                  borderRadius: 12, fontSize: 14,
                  color: '#cbd5e1', lineHeight: 1.6,
                }}>
                  {item.details}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMedicalHistory;