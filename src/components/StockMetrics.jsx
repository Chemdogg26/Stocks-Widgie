import './StockMetrics.css';

function StockMetrics({ stockData }) {
  function formatMarketCap(value) {
    if (!value) return 'N/A';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toFixed(2);
  }

  function formatPercent(value) {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  }

  return (
    <div className="stock-metrics">
      <div className="metrics-column">
        <div className="metric-item">
          <span className="metric-label">Open</span>
          <span className="metric-value">
            ${stockData.regularMarketOpen?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">High</span>
          <span className="metric-value">
            ${stockData.regularMarketDayHigh?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Low</span>
          <span className="metric-value">
            ${stockData.regularMarketDayLow?.toFixed(2) || 'N/A'}
          </span>
        </div>
      </div>
      <div className="metrics-column">
        <div className="metric-item">
          <span className="metric-label">Mkt cap</span>
          <span className="metric-value">
            {formatMarketCap(stockData.marketCap)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">P/E ratio</span>
          <span className="metric-value">
            {stockData.trailingPE?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">52-wk high</span>
          <span className="metric-value">
            ${stockData.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">52-wk low</span>
          <span className="metric-value">
            ${stockData.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Dividend</span>
          <span className="metric-value">
            {formatPercent(stockData.dividendYield)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Qtrly Div Amt</span>
          <span className="metric-value">
            ${stockData.trailingAnnualDividendRate?.toFixed(2) || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StockMetrics;
