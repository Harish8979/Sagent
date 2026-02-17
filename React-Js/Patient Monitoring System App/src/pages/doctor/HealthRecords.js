import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiActivity, FiThermometer, FiWind, FiSearch } from 'react-icons/fi';

const HealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get('/health-records');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filtered = records.filter((r) =>
    r.patient?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  const getColor = (type, value) => {
    if (type === 'bp' && value > 140) return '#ef4444';
    if (type === 'bp' && value > 130) return '#f59e0b';
    if (type === 'o2' && value < 95) return '#ef4444';
    if (type === 'temp' && value > 100.4) return '#ef4444';
    return '#10b981';
  };

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Health Records</h1>
        <p>View and manage patient health data</p>
      </motion.div>

      <motion.div
        style={{ marginBottom: 24 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="form-input-icon" style={{ maxWidth: 400 }}>
          <FiSearch className="icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 20,
      }}>
        {filtered.map((record, index) => (
          <AnimatedCard key={record.recordId} delay={index * 0.1} className="data-card">
            <div style={{ padding: 24 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  {record.patient?.name || 'Unknown'}
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{record.date}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <motion.div
                  style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 12, textAlign: 'center' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiActivity style={{ fontSize: 22, color: getColor('bp', record.bloodPressureSystolic) }} />
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>BP</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: getColor('bp', record.bloodPressureSystolic) }}>
                    {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                  </div>
                </motion.div>

                <motion.div
                  style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 12, textAlign: 'center' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiWind style={{ fontSize: 22, color: getColor('o2', record.oxygenLevel) }} />
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>O2</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: getColor('o2', record.oxygenLevel) }}>
                    {record.oxygenLevel}%
                  </div>
                </motion.div>

                <motion.div
                  style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 12, textAlign: 'center' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FiThermometer style={{ fontSize: 22, color: getColor('temp', record.temperature) }} />
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Temp</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: getColor('temp', record.temperature) }}>
                    {record.temperature}°F
                  </div>
                </motion.div>
              </div>

              {record.notes && (
                <div style={{
                  marginTop: 12, padding: 10, background: 'rgba(99,102,241,0.05)',
                  borderRadius: 8, fontSize: 12, color: '#94a3b8',
                }}>
                  📝 {record.notes}
                </div>
              )}
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default HealthRecords;