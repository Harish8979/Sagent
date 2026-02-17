import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  FiBell, FiCalendar, FiFileText,
  FiMessageSquare, FiCheckCircle
} from 'react-icons/fi';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications/user/${user.userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const getIcon = (type) => {
    if (type?.includes('APPOINTMENT')) return <FiCalendar />;
    if (type?.includes('LAB') || type?.includes('PRESCRIPTION'))
      return <FiFileText />;
    if (type?.includes('MESSAGE')) return <FiMessageSquare />;
    return <FiBell />;
  };

  const getIconColor = (type) => {
    if (type?.includes('APPOINTMENT'))
      return { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' };
    if (type?.includes('LAB'))
      return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
    if (type?.includes('PRESCRIPTION'))
      return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    if (type?.includes('MESSAGE'))
      return { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' };
    return { bg: 'rgba(100,116,139,0.15)', color: '#64748b' };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Notifications</h1>
        <p>Stay updated with your healthcare alerts</p>
      </motion.div>

      <motion.div
        className="data-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="data-card-header">
          <h3>
            <FiBell style={{ marginRight: 8 }} />
            All Notifications ({notifications.length})
          </h3>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif, index) => {
              const iconStyle = getIconColor(notif.type);
              return (
                <motion.div
                  key={notif.notificationId}
                  className={`notification-item ${
                    !notif.isRead ? 'unread' : ''
                  }`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  whileHover={{ x: 4 }}
                >
                  <motion.div
                    className="notification-icon"
                    style={{
                      background: iconStyle.bg,
                      color: iconStyle.color,
                    }}
                    whileHover={{ rotate: 15 }}
                  >
                    {getIcon(notif.type)}
                  </motion.div>
                  <div className="notification-content">
                    <h4>{notif.type?.replace(/_/g, ' ')}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <motion.button
                      className="btn btn-sm btn-secondary"
                      onClick={() => markAsRead(notif.notificationId)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ flexShrink: 0 }}
                    >
                      <FiCheckCircle />
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;