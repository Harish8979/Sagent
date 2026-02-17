import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const res = await API.get(`/appointments/patient/${user.userId}`);
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAppointments();
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
        <h1>My Appointments</h1>
        <p>View your scheduled and past appointments</p>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="empty-state-icon"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📅
          </motion.div>
          <h3>No appointments yet</h3>
          <p>Your appointments will appear here</p>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 20,
        }}>
          {appointments.map((appt, index) => (
            <motion.div
              key={appt.appointmentId}
              className="data-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div style={{ padding: 24 }}>
                {/* Status Banner */}
                <div style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  display: 'inline-block',
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  background: appt.status === 'SCHEDULED'
                    ? 'rgba(99,102,241,0.15)'
                    : appt.status === 'COMPLETED'
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(239,68,68,0.15)',
                  color: appt.status === 'SCHEDULED'
                    ? '#818cf8'
                    : appt.status === 'COMPLETED'
                    ? '#10b981'
                    : '#ef4444',
                }}>
                  {appt.status}
                </div>

                {/* Doctor Info */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, marginBottom: 16,
                }}>
                  <motion.div
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 20, fontWeight: 700,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {appt.doctor?.name?.charAt(0) || 'D'}
                  </motion.div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      <FiUser style={{ marginRight: 6, opacity: 0.5 }} />
                      {appt.doctor?.name || 'Doctor'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      License: {appt.doctor?.licenseNumber}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div style={{
                  padding: 12, background: 'rgba(0,0,0,0.2)',
                  borderRadius: 10, marginBottom: 12,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, fontSize: 14,
                  }}>
                    <FiCalendar style={{ color: '#818cf8' }} />
                    <span>
                      {new Date(appt.dateTime).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric',
                        month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, fontSize: 14, marginTop: 6,
                  }}>
                    <FiClock style={{ color: '#f59e0b' }} />
                    <span>
                      {new Date(appt.dateTime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div style={{
                  fontSize: 13, color: '#94a3b8', lineHeight: 1.5,
                }}>
                  📋 {appt.reason}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
