import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-500">
          <span>💪</span> FitTrack
        </Link>
        {user && (
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link to="/log" className="text-gray-400 hover:text-white transition-colors text-sm">Log Workout</Link>
            <Link to="/history" className="text-gray-400 hover:text-white transition-colors text-sm">History</Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <span className="text-sm text-gray-400">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1 px-3">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
