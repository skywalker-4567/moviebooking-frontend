import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-white text-xl font-bold tracking-tight">
        🎬 CineBook
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-zinc-400">
              {user.name} · <span className="text-amber-400">{user.role}</span>
            </span>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="text-zinc-300 hover:text-white">Admin</Link>
            )}
            {user.role === 'THEATRE_OWNER' && (
              <Link to="/owner" className="text-zinc-300 hover:text-white">My Theatres</Link>
            )}
            {user.role === 'CUSTOMER' && (
              <Link to="/my-bookings" className="text-zinc-300 hover:text-white">My Bookings</Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-zinc-300 hover:text-white">Login</Link>
            <Link to="/register" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3 py-1.5 rounded-md">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}