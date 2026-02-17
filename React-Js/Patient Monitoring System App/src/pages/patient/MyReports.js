import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import AnimatedCard from '../../components/AnimatedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiFileText, FiDownload, FiClock } from 'react-icons/fi';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('/reports');
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner />;

  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
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
        <p>View and download your medical reports</p>
      </motion.div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <motion.div
            className="empty-state-icon"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📄
          </motion.div>
          <h3>No reports yet</h3>
          <p>Reports will appear here after your consultations</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {reports.map((report, index) => (
            <AnimatedCard
              key={report.reportId}
              delay={index * 0.1}
              className="data-card"
            >
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
                    marginTop: 16, padding: 12,
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: 12, color: '#94a3b8',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      📎 {report.fileUrl}
                    </span>
                    <motion.button
                      className="btn btn-sm btn-primary"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ width: 'auto', flexShrink: 0, marginLeft: 8 }}
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

export default MyReports;