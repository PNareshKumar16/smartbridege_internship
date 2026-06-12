import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Edit2, Trash2, Users, DollarSign, BarChart3, ListChecks, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const { refreshUser } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('stats'); // stats, stocks, users
  
  // Core lists
  const [stats, setStats] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Alert messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stock CRUD forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStockId, setEditingStockId] = useState(null);
  
  // Form fields
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');

  // User balance adjustment
  const [adjustingUserId, setAdjustingUserId] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats', err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await api.get('/stocks');
      if (res.data.success) {
        setStocks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stocks list', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin users list', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchStocks(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const clearAlerts = () => {
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 4000);
  };

  // ADD Stock submission
  const handleAddStock = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const stockPrice = parseFloat(price);
    if (!symbol || !name || isNaN(stockPrice) || stockPrice <= 0) {
      setErrorMsg('Please enter valid stock symbol, name and a positive price');
      return;
    }

    try {
      const res = await api.post('/admin/stocks', {
        symbol,
        name,
        price: stockPrice,
        sector,
        description,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setShowAddForm(false);
        // Reset form
        setSymbol('');
        setName('');
        setPrice('');
        setSector('');
        setDescription('');
        await fetchStocks();
        clearAlerts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create stock');
    }
  };

  // EDIT Stock action
  const handleStartEdit = (stock) => {
    setEditingStockId(stock._id);
    setName(stock.name);
    setPrice(stock.price.toString());
    setSector(stock.sector);
    setDescription(stock.description);
  };

  const handleCancelEdit = () => {
    setEditingStockId(null);
    setName('');
    setPrice('');
    setSector('');
    setDescription('');
  };

  const handleUpdateStock = async (e, id) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/admin/stocks/${id}`, {
        name,
        price: parseFloat(price),
        sector,
        description,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setEditingStockId(null);
        handleCancelEdit();
        await fetchStocks();
        clearAlerts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update stock');
    }
  };

  // DELETE Stock submission
  const handleDeleteStock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock listing?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.delete(`/admin/stocks/${id}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchStocks();
        clearAlerts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete stock');
    }
  };

  // BALANCE Adjustment submission
  const handleAdjustBalanceSubmit = async (e, userId) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const parsedBalance = parseFloat(newBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setErrorMsg('Please enter a valid balance amount');
      return;
    }

    try {
      const res = await api.put(`/admin/users/${userId}/balance`, { balance: parsedBalance });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setAdjustingUserId(null);
        setNewBalance('');
        await fetchUsers();
        await refreshUser(); // Update admin's own header balance too if they adjust themselves
        clearAlerts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to adjust user balance');
    }
  };

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-info mb-3" role="status"></div>
        <p className="text-white-50">Syncing administrative metrics...</p>
      </div>
    );
  }

  return (
    <div className="main-content slide-up">
      {/* Title */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-purple bg-gradient p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center">
          <Shield size={26} />
        </div>
        <div>
          <h2 className="fw-bold m-0 text-white">Admin Moderation Dashboard</h2>
          <p className="text-white-50 m-0 mt-1" style={{ fontSize: '0.9rem' }}>
            System-level audit tools, user balances adjustments, and listings moderation.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 border-0 mb-4" style={{ background: 'rgba(16,185,129,0.1)', color: '#a7f3d0' }}>
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <div>{successMsg}</div>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 border-0 mb-4" style={{ background: 'rgba(244,63,94,0.1)', color: '#fda4af' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Nav Tabs */}
      <ul className="nav nav-pills gap-2 mb-4 pb-2 border-bottom border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('stats')}
            className={`nav-link px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 border border-transparent transition-all text-white ${
              activeTab === 'stats' ? 'bg-purple bg-opacity-15 border-purple border-opacity-35 fw-semibold' : 'opacity-70 hover-opacity-100'
            }`}
            style={{ color: activeTab === 'stats' ? '#c084fc' : undefined, borderColor: activeTab === 'stats' ? 'rgba(192,132,252,0.3)' : undefined }}
          >
            <BarChart3 size={18} /> Platform Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`nav-link px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 border border-transparent transition-all text-white ${
              activeTab === 'stocks' ? 'bg-purple bg-opacity-15 border-purple border-opacity-35 fw-semibold' : 'opacity-70 hover-opacity-100'
            }`}
            style={{ color: activeTab === 'stocks' ? '#c084fc' : undefined, borderColor: activeTab === 'stocks' ? 'rgba(192,132,252,0.3)' : undefined }}
          >
            <ListChecks size={18} /> Manage Stock Listings
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('users')}
            className={`nav-link px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 border border-transparent transition-all text-white ${
              activeTab === 'users' ? 'bg-purple bg-opacity-15 border-purple border-opacity-35 fw-semibold' : 'opacity-70 hover-opacity-100'
            }`}
            style={{ color: activeTab === 'users' ? '#c084fc' : undefined, borderColor: activeTab === 'users' ? 'rgba(192,132,252,0.3)' : undefined }}
          >
            <Users size={18} /> Manage User Balances
          </button>
        </li>
      </ul>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'stats' && stats && (
        <div className="row g-4 slide-up">
          <div className="col-12 col-md-4">
            <div className="glass-panel p-4 text-center">
              <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.85rem' }}>Global Trade Volume</span>
              <h2 className="fw-bold text-white mb-0">${stats.totalTradeVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              <span className="text-white-50" style={{ fontSize: '0.75rem' }}>Sum of all trades executed</span>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="glass-panel p-4 text-center">
              <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.85rem' }}>Total Transactions Count</span>
              <h2 className="fw-bold text-info mb-0">{stats.totalTransactions}</h2>
              <span className="text-white-50" style={{ fontSize: '0.75rem' }}>BUY & SELL trade operations log</span>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="glass-panel p-4 text-center">
              <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.85rem' }}>Active Traders</span>
              <h2 className="fw-bold text-white mb-0">{stats.userCount} <span className="text-white-50" style={{ fontSize: '1rem' }}>Users</span></h2>
              <span className="text-white-50" style={{ fontSize: '0.75rem' }}>Monitoring {stats.adminCount} administrator accounts</span>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="glass-panel p-4">
              <h5 className="fw-bold text-white mb-3">Popular Stocks by Trade Volume</h5>
              <div className="table-responsive">
                <table className="table table-dark align-middle m-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr style={{ borderColor: 'var(--border-color)' }}>
                      <th className="text-white-50 py-2" style={{ fontSize: '0.8rem' }}>SYMBOL</th>
                      <th className="text-white-50 py-2 text-end" style={{ fontSize: '0.8rem' }}>VOLUME SOLD/BOUGHT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.popularStocks && stats.popularStocks.length > 0 ? (
                      stats.popularStocks.map((p, idx) => (
                        <tr key={idx} style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                          <td className="fw-bold text-info py-2">{p.symbol}</td>
                          <td className="text-end fw-bold text-white py-2">{p.volume.toLocaleString()} Shares</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-white-50">No trade records available yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="glass-panel p-4">
              <h5 className="fw-bold text-white mb-3">Platform Overall Asset Pool</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Total Cash held in user wallets:</span>
                <span className="fw-bold text-white">${stats.totalSystemCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-white-50 mt-3" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Administrators can check these figures to inspect virtual currency inflation across the platform. Use the "Manage User Balances" tab to audit specific account records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK LISTINGS CRUD */}
      {activeTab === 'stocks' && (
        <div className="slide-up">
          {/* Header & Add Button */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0 text-white">Stock Listings Catalog</h5>
            <button
              onClick={() => { setShowAddForm(!showAddForm); handleCancelEdit(); }}
              className="btn-primary-glass btn-sm px-3 py-2 rounded-3"
            >
              <Plus size={16} /> {showAddForm ? 'Close Form' : 'Add New Ticker'}
            </button>
          </div>

          {/* Add Stock Form */}
          {showAddForm && (
            <div className="glass-panel p-4 mb-4">
              <h6 className="fw-bold mb-3 text-white">Create New Stock Ticker</h6>
              <form onSubmit={handleAddStock} className="row g-3">
                <div className="col-6 col-md-3">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. MSFT"
                    className="form-control glass-input"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Microsoft"
                    className="form-control glass-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Initial Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    className="form-control glass-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Technology"
                    className="form-control glass-input"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Description</label>
                  <textarea
                    rows="2"
                    placeholder="Enter short company profile details..."
                    className="form-control glass-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="col-12 mt-3">
                  <button type="submit" className="btn-success-glass btn-sm py-2 px-4">
                    Create Listing
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Stock Form (Conditional Overlay) */}
          {editingStockId && (
            <div className="glass-panel p-4 mb-4 border border-info border-opacity-35" style={{ background: 'rgba(56, 189, 248, 0.03)' }}>
              <h6 className="fw-bold mb-3 text-info">Edit Stock Listing Settings</h6>
              <form onSubmit={(e) => handleUpdateStock(e, editingStockId)} className="row g-3">
                <div className="col-6 col-md-4">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Company Name</label>
                  <input
                    type="text"
                    className="form-control glass-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Manual Price Adjustment ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control glass-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Sector</label>
                  <input
                    type="text"
                    className="form-control glass-input"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>Description</label>
                  <textarea
                    rows="2"
                    className="form-control glass-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="col-12 mt-3 d-flex gap-2">
                  <button type="submit" className="btn-primary-glass btn-sm py-2 px-4">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-sm btn-outline-secondary rounded-3 px-3 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stocks CRUD table */}
          <div className="glass-panel overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle m-0" style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border-color)' }}>
                    <th className="px-4 py-3 text-white-50" style={{ fontSize: '0.8rem' }}>SYMBOL</th>
                    <th className="py-3 text-white-50" style={{ fontSize: '0.8rem' }}>NAME</th>
                    <th className="py-3 text-white-50" style={{ fontSize: '0.8rem' }}>SECTOR</th>
                    <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem' }}>PRICE</th>
                    <th className="px-4 py-3 text-center text-white-50" style={{ fontSize: '0.8rem' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length > 0 ? (
                    stocks.map((stock) => (
                      <tr key={stock._id} style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                        <td className="px-4 py-3 fw-bold text-info">{stock.symbol}</td>
                        <td className="py-3 text-white">{stock.name}</td>
                        <td className="py-3"><span className="badge bg-secondary opacity-75">{stock.sector}</span></td>
                        <td className="py-3 text-end fw-bold">${stock.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => { handleStartEdit(stock); setShowAddForm(false); }}
                              className="btn btn-sm btn-outline-info rounded-3 p-1.5 transition-all d-flex align-items-center justify-content-center"
                              title="Edit Listing"
                              style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock._id)}
                              className="btn btn-sm btn-outline-danger rounded-3 p-1.5 transition-all d-flex align-items-center justify-content-center"
                              title="Delete Listing"
                              style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-white-50">No stocks registered on this system.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER BALANCE MODERATOR */}
      {activeTab === 'users' && (
        <div className="slide-up">
          <h5 className="fw-bold mb-3 text-white">Traders Cash Balances Control</h5>
          
          <div className="glass-panel overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle m-0" style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border-color)' }}>
                    <th className="px-4 py-3 text-white-50" style={{ fontSize: '0.8rem' }}>USERNAME</th>
                    <th className="py-3 text-white-50" style={{ fontSize: '0.8rem' }}>EMAIL ADDRESS</th>
                    <th className="py-3 text-white-50" style={{ fontSize: '0.8rem' }}>ROLE</th>
                    <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem' }}>CASH BALANCE</th>
                    <th className="px-4 py-3 text-center text-white-50" style={{ fontSize: '0.8rem' }}>BALANCE MODIFICATION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u._id} style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                        <td className="px-4 py-3 fw-semibold text-white">{u.username}</td>
                        <td className="py-3 text-white-50">{u.email}</td>
                        <td className="py-3">
                          <span className={`badge ${u.role === 'ADMIN' ? 'bg-purple bg-opacity-10 text-purple border border-purple border-opacity-20' : 'bg-secondary bg-opacity-50 text-white-50'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-end fw-bold text-white">
                          ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {adjustingUserId === u._id ? (
                            <form onSubmit={(e) => handleAdjustBalanceSubmit(e, u._id)} className="d-flex align-items-center justify-content-center gap-2 m-0">
                              <div className="position-relative d-flex align-items-center">
                                <DollarSign size={12} className="position-absolute text-white-50 ms-2" />
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm glass-input ps-4 py-1"
                                  style={{ width: '130px', fontSize: '0.82rem' }}
                                  placeholder="New Balance"
                                  value={newBalance}
                                  onChange={(e) => setNewBalance(e.target.value)}
                                  autoFocus
                                />
                              </div>
                              <button type="submit" className="btn btn-xs btn-success px-2.5 py-1 rounded-3 font-semibold" style={{ fontSize: '0.78rem' }}>
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => { setAdjustingUserId(null); setNewBalance(''); }}
                                className="btn btn-xs btn-outline-secondary px-2 py-1 rounded-3"
                                style={{ fontSize: '0.78rem' }}
                              >
                                X
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => { setAdjustingUserId(u._id); setNewBalance(u.balance.toFixed(2)); }}
                              className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 transition-all d-inline-flex align-items-center gap-1 hover-bg-info"
                              style={{ fontSize: '0.82rem' }}
                            >
                              Adjust Cash Balance
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-white-50">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
