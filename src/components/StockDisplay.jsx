import { useState, useEffect } from 'react';
import { getStockQuote } from '../services/stockService';
import StockChart from './StockChart';
import StockMetrics from './StockMetrics';
import './StockDisplay.css';

function StockDisplay({ symbol, onSettingsClick }) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStockData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getStockQuote(symbol);
        if (mounted) {
          setStockData(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          // Provide user-friendly error messages
          let errorMessage = 'Failed to load stock data';
          if (err.message.includes('Invalid symbol') || err.message.includes('not found')) {
            errorMessage = `Stock symbol "${symbol}" not found. Please check the symbol and try again.`;
          } else if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setLoading(false);
        }
      }
    }

    fetchStockData();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      if (mounted) {
        fetchStockData();
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  if (loading && !stockData) {
    return (
      <div className="stock-display">
        <div className="loading">Loading {symbol}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-display">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!stockData) {
    return null;
  }

  const change = stockData.regularMarketChange || 0;
  const changePercent = stockData.regularMarketChangePercent || 0;
  const isPositive = change >= 0;

  return (
    <div className="stock-display">
      <div className="stock-header">
        <div className="header-left">
          <h1 className="stock-name">{stockData.shortName}</h1>
          <div className="stock-ticker">{stockData.symbol}</div>
        </div>
        <div className="header-right">
          <button className="settings-button" onClick={onSettingsClick} title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      <div className="price-section">
        <div className="current-price">
          ${stockData.regularMarketPrice?.toFixed(2) || 'N/A'}
        </div>
        <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%) ↑ today
        </div>
        <div className="market-status">
          {stockData.marketState === 'REGULAR' ? 'Market Open' : 'Market Closed'}
        </div>
      </div>

      <StockChart symbol={symbol} previousClose={stockData.regularMarketPreviousClose} />

      <StockMetrics stockData={stockData} />
    </div>
  );
}

export default StockDisplay;
