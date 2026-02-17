import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiSearch, FiPhone, FiCalendar } from 'react-icons/fi';

const MyPatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMyPatients = async () => {
      try {
        // Get appointments for this doctor, extract unique patients
        const res = await API.get(`/appointments/doctor/${user.userId}`);
        const patientMap = new Map();
        res.data.forEach((appt) => {
          if (appt.patient && !patientMap.has(appt.patient.patientId)) {
            patientMap.set(appt.patient.patientId, appt.patient);
          }
        });
        setPatients(Array.from(patientMap.values()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPatients();
    // eslint-disable-next-line
  }, []);

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>My Patients</h1>
        <p>Patients assigned to you through appointments</p>
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
            placeholder="Search patients..."
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
        <AnimatePresence>
          {filtered.map((patient, index) => (
            <motion.div
              key={patient.patientId}
              className="data-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div style={{ padding: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
                }}>
                  <motion.div
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22, fontWeight: 700,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {patient.name?.charAt(0)}
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{patient.name}</h3>
                    <span className="badge badge-patient">Patient</span>
                  </div>
                </div>

                <div style={{
                  padding: 12, background: 'rgba(0,0,0,0.2)',
                  borderRadius: 10, fontSize: 13, color: '#94a3b8',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <FiCalendar size={14} />
                    DOB: <strong style={{ color: '#f8fafc' }}>{patient.dateOfBirth}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <FiPhone size={14} />
                    {patient.contactNumber || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiPhone size={14} />
                    Emergency: {patient.emergencyContact || 'N/A'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No patients found</h3>
        </div>
      )}
    </div>
  );
};

export default MyPatients;
