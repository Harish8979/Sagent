import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiClipboard, FiCalendar } from 'react-icons/fi';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await API.get('/consultations');
        setConsultations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Consultations</h1>
        <p>View consultation summaries and prescriptions</p>
      </motion.div>

      {consultations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No consultations recorded</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 20,
        }}>
          {consultations.map((consult, index) => (
            <AnimatedCard
              key={consult.consultationId}
              delay={index * 0.1}
              className="data-card"
            >
              <div style={{ padding: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, marginBottom: 20,
                }}>
                  <motion.div
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 20,
                    }}
                    whileHover={{ rotate: 10 }}
                  >
                    <FiClipboard />
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                      Consultation #{consult.consultationId}
                    </h3>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Appointment #{consult.appointment?.appointmentId}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{
                  padding: 14, background: 'rgba(0,0,0,0.2)',
                  borderRadius: 12, marginBottom: 12,
                }}>
                  <div style={{
                    fontSize: 11, color: '#818cf8',
                    fontWeight: 700, marginBottom: 6,
                    textTransform: 'uppercase',
                  }}>
                    Summary
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                    {consult.summary}
                  </div>
                </div>

                {/* Advice */}
                <div style={{
                  padding: 14, background: 'rgba(16,185,129,0.05)',
                  borderRadius: 12, marginBottom: 12,
                }}>
                  <div style={{
                    fontSize: 11, color: '#10b981',
                    fontWeight: 700, marginBottom: 6,
                    textTransform: 'uppercase',
                  }}>
                    💡 Advice
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                    {consult.advice}
                  </div>
                </div>

                {/* Prescription */}
                <div style={{
                  padding: 14, background: 'rgba(245,158,11,0.05)',
                  borderRadius: 12, marginBottom: 12,
                }}>
                  <div style={{
                    fontSize: 11, color: '#f59e0b',
                    fontWeight: 700, marginBottom: 6,
                    textTransform: 'uppercase',
                  }}>
                    💊 Prescription
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                    {consult.prescription}
                  </div>
                </div>

                {/* Follow Up */}
                {consult.followUpDate && (
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, fontSize: 13, color: '#94a3b8',
                  }}>
                    <FiCalendar style={{ color: '#818cf8' }} />
                    Follow-up: <strong style={{ color: '#f8fafc' }}>
                      {consult.followUpDate}
                    </strong>
                  </div>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Consultations;