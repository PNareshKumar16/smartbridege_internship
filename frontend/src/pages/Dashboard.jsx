import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Search, Flame, TrendingUp, TrendingDown, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';

export const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [lastPrices, setLastPrices] = useState({});
  const [flashStates, setFlashStates] = useState({});
  
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const pollTimerRef = useRef(null);

  const fetchStocks = async (isSilent = false) => {
    try {
      const res = await api.get('/stocks');
      if (res.data.success) {
        const newStocks = res.data.data;
        
        if (isSilent) {
          // Detect changes for flashing effect
          const newFlashes = {};
          newStocks.forEach(stock => {
            const oldPrice = lastPrices[stock.symbol];
            if (oldPrice !== undefined && oldPrice !== stock.price) {
              newFlashes[stock.symbol] = stock.price > oldPrice ? 'up' : 'down';
            }
          });
          
          if (Object.keys(newFlashes).length > 0) {
            setFlashStates(newFlashes);
            // Clear flashes after 800ms
            setTimeout(() => {
              setFlashStates({});
            }, 800);
          }
        }

        // Cache prices
        const priceMap = {};
        newStocks.forEach(s => { priceMap[s.symbol] = s.price; });
        setLastPrices(priceMap);
        setStocks(newStocks);
      }
    } catch (err) {
      console.error('Error fetching stocks', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll database every 5 seconds for real-time prices
  useEffect(() => {
    fetchStocks();
    refreshUser(); // Keep user balance fresh

    pollTimerRef.current = setInterval(() => {
      fetchStocks(true);
      refreshUser();
    }, 5000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [lastPrices]);

  // Compute stats
  const getTopGainer = () => {
    if (stocks.length === 0) return null;
    return [...stocks].sort((a, b) => {
      const changeA = ((a.price - a.prevClose) / a.prevClose) * 100;
      const changeB = ((b.price - b.prevClose) / b.prevClose) * 100;
      return changeB - changeA;
    })[0];
  };

  const getTopLoser = () => {
    if (stocks.length === 0) return null;
    return [...stocks].sort((a, b) => {
      const changeA = ((a.price - a.prevClose) / a.prevClose) * 100;
      const changeB = ((b.price - b.prevClose) / b.prevClose) * 100;
      return changeA - changeB;
    })[0];
  };

  const topGainer = getTopGainer();
  const topLoser = getTopLoser();
  
  // Unique sectors for filter dropdown
  const sectors = [...new Set(stocks.map(s => s.sector))];

  // Filtering logic
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          stock.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === '' || stock.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const getChangeInfo = (stock) => {
    const diff = stock.price - stock.prevClose;
    const percent = (diff / stock.prevClose) * 100;
    return {
      diff: diff.toFixed(2),
      percent: percent.toFixed(2),
      isPositive: diff >= 0
    };
  };

  if (loading && stocks.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-info mb-3" role="status"></div>
        <p className="text-white-50">Syncing live market data...</p>
      </div>
    );
  }

  return (
    <div className="main-content slide-up">
      {/* Header and Title */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2">
            Live Market Dashboard
            <span className="live-badge">
              <span className="live-dot"></span>
              Live Price Ticks
            </span>
          </h2>
          <p className="text-white-50 m-0 mt-1" style={{ fontSize: '0.9rem' }}>
            Simulated real-time quotes updating every 5 seconds.
          </p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchStocks(); refreshUser(); }}
          className="btn btn-outline-info rounded-3 d-flex align-items-center gap-2 border-opacity-20 transition-all px-3 py-2"
          style={{ background: 'rgba(56, 189, 248, 0.05)' }}
        >
          <RefreshCw size={16} /> Force Sync
        </button>
      </div>

      {/* Top Cards Widgets */}
      <div className="row g-4 mb-4">
        {/* Top Gainer Widget */}
        <div className="col-12 col-md-4">
          <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Top Gainer</span>
              <TrendingUp size={18} className="text-success" />
            </div>
            {topGainer && (
              <div>
                <div className="d-flex justify-content-between align-items-end">
                  <h3 className="fw-bold m-0 text-white">{topGainer.symbol}</h3>
                  <span className="text-success fw-bold">
                    +{(((topGainer.price - topGainer.prevClose) / topGainer.prevClose) * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-white-50 m-0 text-truncate" style={{ fontSize: '0.8rem' }}>{topGainer.name}</p>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-white-50" style={{ fontSize: '0.8rem' }}>Current Price</span>
                  <span className="fw-bold">${topGainer.price.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Loser Widget */}
        <div className="col-12 col-md-4">
          <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Top Loser</span>
              <TrendingDown size={18} className="text-danger" />
            </div>
            {topLoser && (
              <div>
                <div className="d-flex justify-content-between align-items-end">
                  <h3 className="fw-bold m-0 text-white">{topLoser.symbol}</h3>
                  <span className="text-danger fw-bold">
                    {(((topLoser.price - topLoser.prevClose) / topLoser.prevClose) * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-white-50 m-0 text-truncate" style={{ fontSize: '0.8rem' }}>{topLoser.name}</p>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-white-50" style={{ fontSize: '0.8rem' }}>Current Price</span>
                  <span className="fw-bold">${topLoser.price.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Market Stats Widget */}
        <div className="col-12 col-md-4">
          <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Market Summary</span>
              <BarChart2 size={18} className="text-info" />
            </div>
            <div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Listed Tickers</span>
                <span className="fw-bold">{stocks.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Available Sectors</span>
                <span className="fw-bold">{sectors.length}</span>
              </div>
              <div className="d-flex justify-content-between mt-3 pt-2 border-top border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Cash Balance</span>
                <span className="text-info fw-bold">
                  ${Number(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel p-3 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <div className="position-relative d-flex align-items-center">
              <Search size={18} className="position-absolute ms-3 text-white-50" />
              <input
                type="text"
                className="form-control glass-input w-100 ps-5"
                placeholder="Search by ticker symbol or company name (e.g. AAPL, Apple)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select glass-input w-100"
              style={{ backgroundPosition: 'right 1rem center', backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")" }}
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
            >
              <option value="">All Sectors</option>
              {sectors.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="glass-panel overflow-hidden">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle m-0" style={{ backgroundColor: 'transparent' }}>
            <thead>
              <tr style={{ borderColor: 'var(--border-color)' }}>
                <th className="px-4 py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>TICKER</th>
                <th className="py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>NAME</th>
                <th className="py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>SECTOR</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>LAST PRICE</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>24H CHANGE</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>DAILY RANGE (L/H)</th>
                <th className="px-4 py-3 text-center text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => {
                  const chg = getChangeInfo(stock);
                  const isUpFlash = flashStates[stock.symbol] === 'up';
                  const isDownFlash = flashStates[stock.symbol] === 'down';
                  const flashClass = isUpFlash ? 'price-up' : isDownFlash ? 'price-down' : '';

                  return (
                    <tr
                      key={stock._id}
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                      style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                      className={flashClass}
                    >
                      <td className="px-4 py-3 fw-bold text-info" style={{ fontSize: '1.05rem' }}>{stock.symbol}</td>
                      <td className="py-3 text-white text-truncate" style={{ maxWidth: '180px' }}>{stock.name}</td>
                      <td className="py-3"><span className="badge bg-secondary opacity-75">{stock.sector}</span></td>
                      <td className="py-3 text-end fw-bold">${stock.price.toFixed(2)}</td>
                      <td className={`py-3 text-end fw-bold ${chg.isPositive ? 'text-success' : 'text-danger'}`}>
                        {chg.isPositive ? `+${chg.diff}` : chg.diff} ({chg.isPositive ? '+' : ''}{chg.percent}%)
                      </td>
                      <td className="py-3 text-end text-white-50" style={{ fontSize: '0.85rem' }}>
                        ${stock.low.toFixed(2)} - ${stock.high.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 transition-all d-inline-flex align-items-center gap-1 hover-bg-info">
                          Trade <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    No stocks matching search or filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
