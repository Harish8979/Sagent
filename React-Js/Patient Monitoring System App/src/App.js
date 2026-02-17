import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import PatientMyAppointments from './pages/patient/MyAppointments';
import PatientMyHealthRecords from './pages/patient/MyHealthRecords';
import PatientMyMedicalHistory from './pages/patient/MyMedicalHistory';
import PatientFindDoctors from './pages/patient/FindDoctors';
import PatientMyReports from './pages/patient/MyReports';
import DoctorMyAppointments from './pages/doctor/MyAppointments';
import DoctorMyPatients from './pages/doctor/MyPatients';
import DoctorHealthRecords from './pages/doctor/HealthRecords';
import DoctorConsultations from './pages/doctor/Consultations';
import DoctorReports from './pages/doctor/Reports';
import AdminAllPatients from './pages/admin/AllPatients';
import AdminAllDoctors from './pages/admin/AllDoctors';
import AdminAllAppointments from './pages/admin/AllAppointments';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/messages"
            element={(
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/notifications"
            element={(
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/patient/appointments"
            element={(
              <RoleRoute allowedRoles={['PATIENT']}>
                <PatientMyAppointments />
              </RoleRoute>
            )}
          />
          <Route
            path="/patient/health-records"
            element={(
              <RoleRoute allowedRoles={['PATIENT']}>
                <PatientMyHealthRecords />
              </RoleRoute>
            )}
          />
          <Route
            path="/patient/medical-history"
            element={(
              <RoleRoute allowedRoles={['PATIENT']}>
                <PatientMyMedicalHistory />
              </RoleRoute>
            )}
          />
          <Route
            path="/patient/find-doctors"
            element={(
              <RoleRoute allowedRoles={['PATIENT']}>
                <PatientFindDoctors />
              </RoleRoute>
            )}
          />
          <Route
            path="/patient/reports"
            element={(
              <RoleRoute allowedRoles={['PATIENT']}>
                <PatientMyReports />
              </RoleRoute>
            )}
          />

          <Route
            path="/doctor/appointments"
            element={(
              <RoleRoute allowedRoles={['DOCTOR']}>
                <DoctorMyAppointments />
              </RoleRoute>
            )}
          />
          <Route
            path="/doctor/patients"
            element={(
              <RoleRoute allowedRoles={['DOCTOR']}>
                <DoctorMyPatients />
              </RoleRoute>
            )}
          />
          <Route
            path="/doctor/health-records"
            element={(
              <RoleRoute allowedRoles={['DOCTOR']}>
                <DoctorHealthRecords />
              </RoleRoute>
            )}
          />
          <Route
            path="/doctor/consultations"
            element={(
              <RoleRoute allowedRoles={['DOCTOR']}>
                <DoctorConsultations />
              </RoleRoute>
            )}
          />
          <Route
            path="/doctor/reports"
            element={(
              <RoleRoute allowedRoles={['DOCTOR']}>
                <DoctorReports />
              </RoleRoute>
            )}
          />

          <Route
            path="/admin/patients"
            element={(
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminAllPatients />
              </RoleRoute>
            )}
          />
          <Route
            path="/admin/doctors"
            element={(
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminAllDoctors />
              </RoleRoute>
            )}
          />
          <Route
            path="/admin/appointments"
            element={(
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminAllAppointments />
              </RoleRoute>
            )}
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
