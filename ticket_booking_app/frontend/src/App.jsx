import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { useAuth } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ReviewPage } from './pages/ReviewPage';
import { ShowtimePage } from './pages/ShowtimePage';

function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (isAdmin) {
    return (
      <AppShell>
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/showtimes/:showtimeId" element={<ShowtimePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
