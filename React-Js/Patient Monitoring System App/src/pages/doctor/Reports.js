import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiFileText, FiDownload, FiClock } from 'react-icons/fi';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get(`/reports/user/${user.userId}`);
        setReports(res.data);
      } catch (err) {
        // Fallback to all reports
        try {
          const allRes = await API.get('/reports');
          setReports(allRes.data);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
    // eslint-disable-next-line
  }, []);

  if (loading) return <LoadingSpinner />;

  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #fa709a, #fee140)',
  ];

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>My Reports</h1>
        <p>Reports you have generated</p>
      </motion.div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No reports generated yet</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {reports.map((report, index) => (
            <AnimatedCard key={report.reportId} delay={index * 0.1} className="data-card">
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <motion.div
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: gradients[index % gradients.length],
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22, flexShrink: 0,
                    }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <FiFileText />
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      {report.reportType}
                    </h3>
                    <div style={{
                      fontSize: 12, color: '#64748b',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <FiClock size={12} />
                      {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {report.fileUrl && (
                  <div style={{
                    marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.2)',
                    borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      📎 {report.fileUrl}
                    </span>
                    <motion.button
                      className="btn btn-sm btn-primary"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ width: 'auto' }}
                    >
                      <FiDownload />
                    </motion.button>
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

export default Reports;