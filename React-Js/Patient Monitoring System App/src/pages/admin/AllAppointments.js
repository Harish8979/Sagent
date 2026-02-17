import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      toast.success(`Updated to ${status}`);
      fetchAppointments();
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>All Appointments (Admin)</h1>
        <p>Manage all system appointments</p>
      </motion.div>

      <motion.div style={{ display: 'flex', gap: 8, marginBottom: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <motion.button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)} whileHover={{ scale: 1.05 }} style={{ borderRadius: 20 }}>
            {f} ({f === 'ALL' ? appointments.length : appointments.filter((a) => a.status === f).length})
          </motion.button>
        ))}
      </motion.div>

      <motion.div className="data-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>DateTime</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((appt, i) => (
                <motion.tr key={appt.appointmentId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} layout>
                  <td>#{appt.appointmentId}</td>
                  <td>{appt.patient?.name || 'N/A'}</td>
                  <td>{appt.doctor?.name || 'N/A'}</td>
                  <td><FiClock style={{ marginRight: 4, opacity: 0.5 }} />{new Date(appt.dateTime).toLocaleString()}</td>
                  <td><span className={`badge badge-${appt.status?.toLowerCase()}`}>{appt.status}</span></td>
                  <td>
                    {appt.status === 'SCHEDULED' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <motion.button className="btn btn-sm btn-success" onClick={() => updateStatus(appt.appointmentId, 'COMPLETED')} whileHover={{ scale: 1.1 }}><FiCheck /></motion.button>
                        <motion.button className="btn btn-sm btn-danger" onClick={() => updateStatus(appt.appointmentId, 'CANCELLED')} whileHover={{ scale: 1.1 }}><FiX /></motion.button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AllAppointments;