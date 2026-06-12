import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Wallet, Shield, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // Don't show navbar if not logged in

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-glass">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="bg-info bg-gradient p-2 rounded-3 text-dark d-flex align-items-center justify-content-center">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <span className="fw-bold tracking-wide" style={{ letterSpacing: '0.5px' }}>
            ShopEZ <span className="text-info">Stocks</span>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <Link
                className={`nav-link px-3 py-2 rounded-3 text-white d-flex align-items-center gap-2 transition-all ${
                  isActive('/') ? 'bg-info bg-opacity-10 border border-info border-opacity-20 text-info' : 'opacity-75 hover-opacity-100'
                }`}
                to="/"
              >
                <TrendingUp size={18} />
                Market
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link px-3 py-2 rounded-3 text-white d-flex align-items-center gap-2 transition-all ${
                  isActive('/portfolio') ? 'bg-info bg-opacity-10 border border-info border-opacity-20 text-info' : 'opacity-75 hover-opacity-100'
                }`}
                to="/portfolio"
              >
                <Wallet size={18} />
                Portfolio
              </Link>
            </li>
            {user.role === 'ADMIN' && (
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 py-2 rounded-3 text-white d-flex align-items-center gap-2 transition-all ${
                    isActive('/admin') ? 'bg-purple bg-opacity-10 border border-purple border-opacity-20 text-purple' : 'opacity-75 hover-opacity-100'
                  }`}
                  to="/admin"
                  style={{ color: isActive('/admin') ? '#c084fc' : undefined }}
                >
                  <Shield size={18} />
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {/* User Profile and Balance */}
            <div className="d-flex flex-column align-items-lg-end text-white-50">
              <span className="text-white d-flex align-items-center gap-1 font-semibold" style={{ fontSize: '0.95rem' }}>
                <User size={14} className="text-info" /> {user.username}
                <span className="badge bg-secondary ms-1" style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </span>
              <span className="text-info fw-bold" style={{ fontSize: '0.9rem' }}>
                Balance: <span className="text-white">${Number(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger px-3 py-2 rounded-3 d-flex align-items-center gap-2 border-opacity-20 hover-bg-danger transition-all"
              style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.2)' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
