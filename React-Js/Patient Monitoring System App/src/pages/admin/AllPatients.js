import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiUsers, FiSearch, FiPhone, FiCalendar } from 'react-icons/fi';

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/patients');
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>All Patients (Admin)</h1>
        <p>Manage all registered patients</p>
      </motion.div>

      <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="form-input-icon" style={{ maxWidth: 400 }}>
          <FiSearch className="icon" />
          <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      <motion.div className="data-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="data-card-header">
          <h3><FiUsers style={{ marginRight: 8 }} /> All Patients ({filtered.length})</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>DOB</th><th>Contact</th><th>Emergency</th></tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.tr key={p.patientId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} layout>
                  <td>#{p.patientId}</td>
                  <td>{p.name}</td>
                  <td><FiCalendar style={{ marginRight: 4, opacity: 0.5 }} />{p.dateOfBirth}</td>
                  <td><FiPhone style={{ marginRight: 4, opacity: 0.5 }} />{p.contactNumber}</td>
                  <td>{p.emergencyContact}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AllPatients;