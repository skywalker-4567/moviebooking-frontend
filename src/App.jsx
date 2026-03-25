import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import BookingConfirm from './pages/BookingConfirm';
import MyBookings from './pages/MyBookings';
import AdminPanel from './pages/admin/AdminPanel';
import OwnerPanel from './pages/owner/OwnerPanel';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/shows/:showId/seats" element={
          <ProtectedRoute roles={['CUSTOMER']}><SeatSelection /></ProtectedRoute>
        }/>
        <Route path="/booking/confirm" element={
          <ProtectedRoute roles={['CUSTOMER']}><BookingConfirm /></ProtectedRoute>
        }/>
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['CUSTOMER']}><MyBookings /></ProtectedRoute>
        }/>
        <Route path="/admin" element={
          <ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>
        }/>
        <Route path="/owner" element={
          <ProtectedRoute roles={['THEATRE_OWNER']}><OwnerPanel /></ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}