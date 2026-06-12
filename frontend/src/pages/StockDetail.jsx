import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StockChart from '../components/StockChart';
import { ArrowLeft, Wallet, ShoppingBag, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [portfolioHolding, setPortfolioHolding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Trade widget state
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');
  
  const pollTimerRef = useRef(null);

  const fetchStockData = async () => {
    try {
      const res = await api.get(`/stocks/${symbol}`);
      if (res.data.success) {
        setStock(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stock detail', err);
      setError('Failed to load stock details');
    }
  };

  const fetchHoldingData = async () => {
    try {
      const res = await api.get('/portfolio');
      if (res.data.success) {
        const holdings = res.data.data.holdings;
        const matching = holdings.find((h) => h.symbol === symbol.toUpperCase());
        setPortfolioHolding(matching || null);
      }
    } catch (err) {
      console.error('Error fetching portfolio holding', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStockData();
    fetchHoldingData();
    setLoading(false);

    // Poll for live stock price changes
    pollTimerRef.current = setInterval(() => {
      fetchStockData();
      fetchHoldingData();
    }, 5000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [symbol]);

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setTradeError('');
    setTradeSuccess('');
    setTradeLoading(true);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Quantity must be a positive number');
      setTradeLoading(false);
      return;
    }

    try {
      const endpoint = tradeType === 'BUY' ? '/trade/buy' : '/trade/sell';
      const res = await api.post(endpoint, { symbol, quantity: qty });
      
      if (res.data.success) {
        setTradeSuccess(res.data.message);
        setQuantity(1);
        await refreshUser();
        await fetchHoldingData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Transaction failed';
      setTradeError(msg);
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading && !stock) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-info mb-3" role="status"></div>
        <p className="text-white-50">Syncing live ticker information...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-danger mb-4">{error || 'Stock not found'}</h4>
        <button onClick={() => navigate('/')} className="btn btn-primary-glass">
          <ArrowLeft size={16} /> Back to Market
        </button>
      </div>
    );
  }

  // Calculation details
  const totalTradeAmount = stock.price * quantity;
  const changeDiff = stock.price - stock.prevClose;
  const changePercent = (changeDiff / stock.prevClose) * 100;
  const isUp = changeDiff >= 0;

  return (
    <div className="main-content slide-up">
      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-outline-secondary rounded-3 d-inline-flex align-items-center gap-2 border-opacity-10 mb-4 transition-all"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> Market Overview
      </button>

      {/* Stock Ticker Profile Header */}
      <div className="glass-panel p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 border border-info border-opacity-20 mb-2" style={{ fontSize: '0.8rem' }}>
              {stock.sector}
            </span>
            <h1 className="fw-bold text-white m-0 d-flex align-items-center gap-3">
              {stock.name} <span className="text-info">({stock.symbol})</span>
            </h1>
            <p className="text-white-50 m-0 mt-2" style={{ maxWidth: '750px', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {stock.description}
            </p>
          </div>
          <div className="text-lg-end">
            <span className="text-white-50" style={{ fontSize: '0.85rem' }}>Current Price</span>
            <h1 className="fw-extrabold text-white m-0" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
              ${stock.price.toFixed(2)}
            </h1>
            <span className={`fw-bold d-inline-flex align-items-center gap-1 ${isUp ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.05rem' }}>
              {isUp ? `+${changeDiff.toFixed(2)}` : changeDiff.toFixed(2)} ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Price Chart & Analytics */}
        <div className="col-12 col-lg-8">
          <div className="glass-panel p-4 mb-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              Performance Chart
              <span className="live-badge" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                <span className="live-dot"></span> Live
              </span>
            </h5>
            <div className="chart-wrapper">
              <StockChart historyData={stock.history} symbol={stock.symbol} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="glass-panel p-3 text-center">
                <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.8rem' }}>Daily High</span>
                <span className="fw-bold text-white">${stock.high.toFixed(2)}</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="glass-panel p-3 text-center">
                <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.8rem' }}>Daily Low</span>
                <span className="fw-bold text-white">${stock.low.toFixed(2)}</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="glass-panel p-3 text-center">
                <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.8rem' }}>Previous Close</span>
                <span className="fw-bold text-white-50">${stock.prevClose.toFixed(2)}</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="glass-panel p-3 text-center">
                <span className="text-white-50 d-block mb-1" style={{ fontSize: '0.8rem' }}>Ticker Volume</span>
                <span className="fw-bold text-white">{(stock.volume || 1000000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trade Execution Widget */}
        <div className="col-12 col-lg-4">
          <div className="glass-panel p-4 h-100">
            <h5 className="fw-bold mb-4 text-center">Trade Simulator</h5>

            {/* Hold Status Widget */}
            <div className="p-3 mb-4 rounded-3 text-white-50" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span className="fw-bold text-white d-block mb-1">Your Portfolio Position:</span>
              {portfolioHolding ? (
                <div>
                  You own <span className="text-info fw-bold">{portfolioHolding.quantity} shares</span><br />
                  Avg Purchase Price: <span className="text-white fw-semibold">${portfolioHolding.averageBuyPrice.toFixed(2)}</span><br />
                  Market Value: <span className="text-white fw-semibold">${portfolioHolding.currentMarketValue.toFixed(2)}</span><br />
                  P&L: <span className={`fw-bold ${portfolioHolding.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                    {portfolioHolding.profitLoss >= 0 ? '+' : ''}${portfolioHolding.profitLoss.toFixed(2)} ({portfolioHolding.profitLoss >= 0 ? '+' : ''}{portfolioHolding.profitLossPercentage.toFixed(2)}%)
                  </span>
                </div>
              ) : (
                <span>No current position in {stock.symbol}.</span>
              )}
            </div>

            {/* Error or Success alerts inside widget */}
            {tradeError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 border-0" style={{ background: 'rgba(244,63,94,0.1)', color: '#fda4af', fontSize: '0.8rem' }}>
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{tradeError}</div>
              </div>
            )}
            {tradeSuccess && (
              <div className="alert alert-success d-flex align-items-center gap-2 border-0" style={{ background: 'rgba(16,185,129,0.1)', color: '#a7f3d0', fontSize: '0.8rem' }}>
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <div>{tradeSuccess}</div>
              </div>
            )}

            {/* BUY/SELL selector */}
            <div className="btn-group w-100 mb-4 p-1 rounded-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <button
                type="button"
                className={`btn btn-sm py-2 rounded-3 border-0 transition-all ${tradeType === 'BUY' ? 'btn-success text-white fw-bold shadow' : 'text-white-50 bg-transparent'}`}
                onClick={() => { setTradeType('BUY'); setTradeError(''); setTradeSuccess(''); }}
              >
                BUY
              </button>
              <button
                type="button"
                className={`btn btn-sm py-2 rounded-3 border-0 transition-all ${tradeType === 'SELL' ? 'btn-danger text-white fw-bold shadow' : 'text-white-50 bg-transparent'}`}
                onClick={() => { setTradeType('SELL'); setTradeError(''); setTradeSuccess(''); }}
              >
                SELL
              </button>
            </div>

            <form onSubmit={handleTradeSubmit} className="d-flex flex-column gap-3">
              <div className="form-group">
                <label className="text-white-50 mb-1" style={{ fontSize: '0.85rem' }}>
                  Shares Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="form-control glass-input text-center fw-bold"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || ''))}
                />
              </div>

              {/* Estimate metrics */}
              <div className="d-flex flex-column gap-2 p-3 my-2 rounded-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.85rem' }}>
                  <span className="text-white-50">Price Per Share</span>
                  <span className="text-white fw-semibold">${stock.price.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.85rem' }}>
                  <span className="text-white-50">Estimated {tradeType === 'BUY' ? 'Cost' : 'Return'}</span>
                  <span className={`fw-bold ${tradeType === 'BUY' ? 'text-info' : 'text-success'}`}>
                    ${isNaN(totalTradeAmount) ? '0.00' : totalTradeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Cash Wallet stats */}
              <div className="d-flex align-items-center justify-content-between text-white-50 mb-2" style={{ fontSize: '0.82rem' }}>
                <span className="d-flex align-items-center gap-1">
                  <Wallet size={12} className="text-info" /> Cash Wallet:
                </span>
                <span className="fw-semibold text-white">
                  ${Number(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {tradeType === 'BUY' ? (
                <button
                  type="submit"
                  disabled={tradeLoading || user.balance < totalTradeAmount || isNaN(quantity)}
                  className="btn-success-glass w-100 py-2.5"
                >
                  <ShoppingBag size={18} /> Buy Shares
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={tradeLoading || !portfolioHolding || portfolioHolding.quantity < quantity || isNaN(quantity)}
                  className="btn-danger-glass w-100 py-2.5"
                >
                  <DollarSign size={18} /> Sell Shares
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StockDetail;
