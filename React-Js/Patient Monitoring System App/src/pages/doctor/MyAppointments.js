import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get(`/appointments/doctor/${user.userId}`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter((a) => a.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>My Appointments</h1>
        <p>Manage your patient appointments</p>
      </motion.div>

      {/* Filter */}
      <motion.div
        style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <motion.button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ borderRadius: 20 }}
          >
            {f} ({f === 'ALL'
              ? appointments.length
              : appointments.filter((a) => a.status === f).length})
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="data-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((appt, index) => (
                <motion.tr
                  key={appt.appointmentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <td>#{appt.appointmentId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, fontSize: 12,
                      }}>
                        {appt.patient?.name?.charAt(0)}
                      </div>
                      {appt.patient?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <FiClock style={{ marginRight: 6, opacity: 0.5 }} />
                    {new Date(appt.dateTime).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-${appt.status?.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>{appt.reason?.substring(0, 30)}...</td>
                  <td>
                    {appt.status === 'SCHEDULED' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <motion.button
                          className="btn btn-sm btn-success"
                          onClick={() => updateStatus(appt.appointmentId, 'COMPLETED')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiCheck />
                        </motion.button>
                        <motion.button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(appt.appointmentId, 'CANCELLED')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiX />
                        </motion.button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No appointments found</h3>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyAppointments;
