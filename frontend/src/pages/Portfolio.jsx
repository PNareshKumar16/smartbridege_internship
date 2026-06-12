import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, Briefcase, TrendingUp, TrendingDown, Clock, ArrowRight, History } from 'lucide-react';

export const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const fetchPortfolioAndHistory = async () => {
    try {
      const [portfolioRes, transRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/transactions')
      ]);

      if (portfolioRes.data.success) {
        setPortfolioData(portfolioRes.data.data);
      }
      if (transRes.data.success) {
        setTransactions(transRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching portfolio data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioAndHistory();
    refreshUser();
  }, []);

  if (loading && !portfolioData) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-info mb-3" role="status"></div>
        <p className="text-white-50">Syncing portfolio holdings...</p>
      </div>
    );
  }

  const holdings = portfolioData?.holdings || [];
  const summary = portfolioData?.summary || {
    cashBalance: user.balance,
    totalHoldingsCost: 0,
    totalHoldingsValue: 0,
    netWorth: user.balance,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
  };

  const isProfit = summary.totalProfitLoss >= 0;

  return (
    <div className="main-content slide-up">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2">
            Your Investment Portfolio
          </h2>
          <p className="text-white-50 m-0 mt-1" style={{ fontSize: '0.9rem' }}>
            Real-time calculations of your virtual asset holdings.
          </p>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="row g-4 mb-4">
        {/* Net Worth Card */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-panel p-4 text-center">
            <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.82rem' }}>Portfolio Net Worth</span>
            <h3 className="fw-bold text-white mb-0">
              ${summary.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-white-50" style={{ fontSize: '0.75rem' }}>Cash + Stocks value</span>
          </div>
        </div>

        {/* Total Profit/Loss Card */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-panel p-4 text-center">
            <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.82rem' }}>Total Return (P&L)</span>
            <h3 className={`fw-bold mb-0 ${isProfit ? 'text-success' : 'text-danger'}`}>
              {isProfit ? '+' : ''}${summary.totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={`fw-bold ${isProfit ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.78rem' }}>
              {isProfit ? '+' : ''}{summary.totalProfitLossPercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Active Holdings Value */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-panel p-4 text-center">
            <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.82rem' }}>Stock Market Assets</span>
            <h3 className="fw-bold text-info mb-0">
              ${summary.totalHoldingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-white-50" style={{ fontSize: '0.75rem' }}>Cost: ${summary.totalHoldingsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Cash Wallet */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-panel p-4 text-center">
            <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.82rem' }}>Cash Balance</span>
            <h3 className="fw-bold text-white mb-0">
              ${summary.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-info" style={{ fontSize: '0.75rem' }}>Ready to invest</span>
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="glass-panel overflow-hidden mb-5">
        <div className="px-4 py-3 border-bottom border-opacity-10 d-flex align-items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <Briefcase size={18} className="text-info" />
          <h5 className="fw-bold m-0 text-white">Current Stock Holdings</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle m-0" style={{ backgroundColor: 'transparent' }}>
            <thead>
              <tr style={{ borderColor: 'var(--border-color)' }}>
                <th className="px-4 py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>TICKER</th>
                <th className="py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>COMPANY NAME</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>QTY OWNED</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>AVG COST</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>TOTAL BASIS</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>LIVE PRICE</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>MARKET VALUE</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>GAIN / LOSS</th>
                <th className="px-4 py-3 text-center text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length > 0 ? (
                holdings.map((holding) => {
                  const holdingProfit = holding.profitLoss >= 0;
                  return (
                    <tr
                      key={holding._id}
                      onClick={() => navigate(`/stock/${holding.symbol}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="px-4 py-3 fw-bold text-info">{holding.symbol}</td>
                      <td className="py-3 text-white text-truncate" style={{ maxWidth: '140px' }}>{holding.name}</td>
                      <td className="py-3 text-end fw-semibold text-white">{holding.quantity}</td>
                      <td className="py-3 text-end text-white-50">${holding.averageBuyPrice.toFixed(2)}</td>
                      <td className="py-3 text-end text-white-50">${holding.totalCost.toFixed(2)}</td>
                      <td className="py-3 text-end fw-bold">${holding.currentPrice.toFixed(2)}</td>
                      <td className="py-3 text-end fw-bold text-white">${holding.currentMarketValue.toFixed(2)}</td>
                      <td className={`py-3 text-end fw-bold ${holdingProfit ? 'text-success' : 'text-danger'}`}>
                        {holdingProfit ? '+' : ''}${holding.profitLoss.toFixed(2)}<br />
                        <span style={{ fontSize: '0.75rem' }}>{holdingProfit ? '+' : ''}{holding.profitLossPercentage.toFixed(2)}%</span>
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
                  <td colSpan="9" className="text-center py-5 text-white-50">
                    You do not own any stocks yet. Go to <span className="text-info" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Market</span> to buy your first shares!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-bottom border-opacity-10 d-flex align-items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <History size={18} className="text-info" />
          <h5 className="fw-bold m-0 text-white">Transaction Logs & Logs History</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-dark align-middle m-0" style={{ backgroundColor: 'transparent' }}>
            <thead>
              <tr style={{ borderColor: 'var(--border-color)' }}>
                <th className="px-4 py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>DATE & TIME</th>
                <th className="py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>TICKER</th>
                <th className="py-3 text-white-50" style={{ fontSize: '0.8rem', fontWeight: 600 }}>TRANSACTION TYPE</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>SHARES QTY</th>
                <th className="py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>PRICE PER SHARE</th>
                <th className="px-4 py-3 text-white-50 text-end" style={{ fontSize: '0.8rem', fontWeight: 600 }}>TOTAL TRANSACTION AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const isBuy = t.type === 'BUY';
                  return (
                    <tr key={t._id} style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                      <td className="px-4 py-3 text-white-50" style={{ fontSize: '0.85rem' }}>
                        {new Date(t.timestamp).toLocaleString('en-US', { hour12: false })}
                      </td>
                      <td className="py-3 fw-bold text-info">{t.symbol}</td>
                      <td className="py-3">
                        <span className={`badge px-2.5 py-1 ${isBuy ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-20' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20'}`} style={{ fontSize: '0.72rem' }}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 text-end fw-semibold text-white">{t.quantity}</td>
                      <td className="py-3 text-end text-white-50">${t.price.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-end fw-bold ${isBuy ? 'text-danger-custom' : 'text-success'}`} style={{ color: isBuy ? '#f43f5e' : '#10b981' }}>
                        {isBuy ? '-' : '+'}${t.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-white-50">
                    No transactions executed yet.
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
export default Portfolio;
