import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getHistoricalData } from '../services/stockService';
import './StockChart.css';

const TIMEFRAMES = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '6M', value: '6mo' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'Max', value: 'max' }
];

function StockChart({ symbol, previousClose }) {
  const [timeframe, setTimeframe] = useState('1d');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchChartData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getHistoricalData(symbol, timeframe);
        
        if (mounted) {
          // Format data for Recharts
          const formatted = data.map(item => ({
            date: item.date.getTime(),
            price: item.price,
            displayDate: formatDate(item.date, timeframe)
          }));
          
          setChartData(formatted);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchChartData();
  }, [symbol, timeframe]);

  function formatDate(date, tf) {
    if (tf === '1d' || tf === '5d') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatTooltipDate(value) {
    const date = new Date(value);
    if (timeframe === '1d' || timeframe === '5d') {
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0;
  const priceRange = maxPrice - minPrice;
  const yAxisDomain = [
    Math.max(0, minPrice - priceRange * 0.1),
    maxPrice + priceRange * 0.1
  ];

  const isPositive = chartData.length > 0 && 
    chartData[chartData.length - 1]?.price >= (chartData[0]?.price || 0);

  return (
    <div className="stock-chart">
      <div className="timeframe-selector">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            className={`timeframe-btn ${timeframe === tf.value ? 'active' : ''}`}
            onClick={() => setTimeframe(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="chart-loading">Loading chart data...</div>
      ) : error ? (
        <div className="chart-error">
          {error.includes('Network error') 
            ? 'Unable to load chart data. Please check your internet connection.'
            : error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="chart-error">No chart data available for this timeframe</div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} onMouseMove={(e) => {
              if (e && e.activePayload) {
                setHoveredPoint(e.activePayload[0]);
              }
            }} onMouseLeave={() => setHoveredPoint(null)}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#0f9d58' : '#ea4335'} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isPositive ? '#0f9d58' : '#ea4335'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => formatDate(new Date(value), timeframe)}
                stroke="#666"
                tick={{ fill: '#999', fontSize: 12 }}
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                stroke="#666"
                tick={{ fill: '#999', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="chart-tooltip">
                        <div className="tooltip-date">{formatTooltipDate(data.date)}</div>
                        <div className="tooltip-price">${data.price.toFixed(2)}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {previousClose && (
                <ReferenceLine
                  y={previousClose}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{ value: 'Previous close', position: 'right', fill: '#999', fontSize: 10 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#0f9d58' : '#ea4335'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                fill="url(#priceGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default StockChart;
