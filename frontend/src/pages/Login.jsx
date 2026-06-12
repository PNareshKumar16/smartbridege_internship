import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const { login, register, user, error, setError } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Reset errors when switching tab
  useEffect(() => {
    setError(null);
    setValidationError('');
  }, [isRegister, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    // Basic Validations
    if (isRegister) {
      if (!username || !email || !password || !confirmPassword) {
        setValidationError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
      
      const res = await register(username, email, password);
      if (res.success) {
        navigate('/');
      }
    } else {
      if (!email || !password) {
        setValidationError('Please fill in all fields');
        return;
      }
      
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 px-3"
      style={{
        background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative cosmic glow points */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '300px',
          height: '300px',
          background: 'rgba(56, 189, 248, 0.08)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '30%',
          width: '350px',
          height: '350px',
          background: 'rgba(168, 85, 247, 0.08)',
          filter: 'blur(120px)',
          borderRadius: '50%',
        }}
      ></div>

      <div className="glass-panel p-4 p-md-5 w-100 slide-up" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold tracking-tight">
            ShopEZ <span className="text-info">Stocks</span>
          </h2>
          <p className="text-white-50 mt-1" style={{ fontSize: '0.9rem' }}>
            {isRegister ? 'Create an account to start stock trading' : 'Sign in to access your investment portfolio'}
          </p>
        </div>

        {/* Validation or API Error Alerts */}
        {(validationError || error) && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 border-0"
            style={{ background: 'rgba(244,63,94,0.1)', color: '#fda4af', fontSize: '0.85rem' }}
          >
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>{validationError || error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {isRegister && (
            <div className="form-group">
              <label className="text-white-50 mb-1" style={{ fontSize: '0.85rem' }}>
                Username
              </label>
              <input
                type="text"
                className="form-control glass-input"
                placeholder="e.g. johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="text-white-50 mb-1" style={{ fontSize: '0.85rem' }}>
              {isRegister ? 'Email Address' : 'Email Address or Username'}
            </label>
            <input
              type="text"
              className="form-control glass-input"
              placeholder={isRegister ? "name@example.com" : "Enter email or username"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="text-white-50 mb-1" style={{ fontSize: '0.85rem' }}>
              Password
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control glass-input pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-white-50 pe-3 d-flex align-items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="text-white-50 mb-1" style={{ fontSize: '0.85rem' }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control glass-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn-primary-glass w-100 py-2 mt-2">
            {isRegister ? (
              <>
                <UserPlus size={18} /> Register Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="btn btn-link text-info text-decoration-none p-0 fw-semibold"
            style={{ fontSize: '0.9rem' }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
