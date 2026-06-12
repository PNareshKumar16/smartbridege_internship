import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RouteGuard } from './components/RouteGuard';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected User Routes */}
            <Route
              path="/"
              element={
                <RouteGuard>
                  <Dashboard />
                </RouteGuard>
              }
            />
            <Route
              path="/stock/:symbol"
              element={
                <RouteGuard>
                  <StockDetail />
                </RouteGuard>
              }
            />
            <Route
              path="/portfolio"
              element={
                <RouteGuard>
                  <Portfolio />
                </RouteGuard>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <RouteGuard adminOnly={true}>
                  <AdminDashboard />
                </RouteGuard>
              }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
