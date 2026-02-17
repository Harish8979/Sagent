import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiUserCheck, FiCalendar, FiActivity,
  FiMessageSquare, FiBell, FiFileText, FiLogOut, FiHeart,
  FiSearch, FiClock
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

  const roleMenuItems = {
    PATIENT: [
      { path: '/patient/appointments', icon: <FiCalendar />, label: 'My Appointments' },
      { path: '/patient/health-records', icon: <FiActivity />, label: 'My Health Records' },
      { path: '/patient/medical-history', icon: <FiClock />, label: 'Medical History' },
      { path: '/patient/find-doctors', icon: <FiSearch />, label: 'Find Doctors' },
      { path: '/patient/reports', icon: <FiFileText />, label: 'My Reports' },
    ],
    DOCTOR: [
      { path: '/doctor/appointments', icon: <FiCalendar />, label: 'My Appointments' },
      { path: '/doctor/patients', icon: <FiUsers />, label: 'My Patients' },
      { path: '/doctor/health-records', icon: <FiActivity />, label: 'Health Records' },
      { path: '/doctor/consultations', icon: <FiMessageSquare />, label: 'Consultations' },
      { path: '/doctor/reports', icon: <FiFileText />, label: 'Reports' },
    ],
    ADMIN: [
      { path: '/admin/patients', icon: <FiUsers />, label: 'All Patients' },
      { path: '/admin/doctors', icon: <FiUserCheck />, label: 'All Doctors' },
      { path: '/admin/appointments', icon: <FiCalendar />, label: 'All Appointments' },
    ],
  };

  const menuItems = [
    { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    ...(roleMenuItems[role] || []),
    { path: '/messages', icon: <FiMessageSquare />, label: 'Messages' },
    { path: '/notifications', icon: <FiBell />, label: 'Notifications' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FiHeart />
        </div>
        <h2>HealthCare</h2>
      </div>

      <nav>
        <ul className="sidebar-nav">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div
                className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </div>
            </motion.li>
          ))}

          <div className="sidebar-divider" />

          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="sidebar-nav-item" onClick={handleLogout}>
              <span className="icon"><FiLogOut /></span>
              Logout
            </div>
          </motion.li>
        </ul>
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
