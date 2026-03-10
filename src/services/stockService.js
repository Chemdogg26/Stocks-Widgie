// Stock service that talks to Electron main via IPC (Alpha Vantage backend)

const cache = new Map();
const CACHE_DURATION = 60_000; // 1 minute

function getCacheKey(symbol, timeframe) {
  return `${symbol}_${timeframe}`;
}

function isCacheValid(entry) {
  return entry && Date.now() - entry.timestamp < CACHE_DURATION;
}

// Map our timeframes to an approximate number of days
function timeframeToDays(timeframe) {
  switch (timeframe) {
    case '1d':
      return 1;
    case '5d':
      return 5;
    case '1mo':
      return 30;
    case '6mo':
      return 180;
    case 'ytd': {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const diff = (Date.now() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(1, Math.round(diff));
    }
    case '1y':
      return 365;
    case '5y':
      return 365 * 5;
    case 'max':
      return Infinity;
    default:
      return 30;
  }
}

export async function getStockQuote(symbolRaw) {
  const symbol = symbolRaw?.trim()?.toUpperCase();
  if (!symbol) {
    throw new Error('Invalid symbol provided');
  }

  if (!window.electronAPI || !window.electronAPI.fetchStockQuote) {
    throw new Error('IPC not available for stock quote');
  }

  const cacheKey = getCacheKey(symbol, 'quote');
  const cached = cache.get(cacheKey);
  if (isCacheValid(cached)) return cached.data;

  let json;
  try {
    json = await window.electronAPI.fetchStockQuote(symbol);
  } catch (err) {
    console.error('Error fetching quote via IPC', err);
    const msg = err?.message || String(err);
    if (msg.includes('Network error')) {
      throw new Error('Network error: Unable to connect to stock data service');
    }
    throw new Error(msg);
  }

  // Alpha Vantage may return a Note or Error Message instead of data
  const note = json?.Note || json?.['Error Message'];
  if (note) {
    if (note.toLowerCase().includes('call frequency')) {
      throw new Error('API limit reached. Please wait a minute and try again.');
    }
    throw new Error(note);
  }

  const q = json?.['Global Quote'];
  if (!q || Object.keys(q).length === 0) {
    throw new Error(`Stock symbol "${symbol}" not found. Please check the symbol and try again.`);
  }

  const price = parseFloat(q['05. price']);
  const prevClose = parseFloat(q['08. previous close']);
  const change = parseFloat(q['09. change']);
  const changePercentStr = q['10. change percent'] || '';
  const changePercent = parseFloat(changePercentStr.replace('%', ''));

  const data = {
    symbol,
    shortName: symbol, // Alpha Vantage doesn't provide company name on this endpoint
    regularMarketPrice: isNaN(price) ? null : price,
    regularMarketPreviousClose: isNaN(prevClose) ? null : prevClose,
    regularMarketChange: isNaN(change) ? null : change,
    regularMarketChangePercent: isNaN(changePercent) ? null : changePercent,
    regularMarketOpen: parseFloat(q['02. open']) || null,
    regularMarketDayHigh: parseFloat(q['03. high']) || null,
    regularMarketDayLow: parseFloat(q['04. low']) || null,
    marketCap: null, // not available from this endpoint
    trailingPE: null,
    dividendYield: null,
    trailingAnnualDividendRate: null,
    fiftyTwoWeekHigh: null,
    fiftyTwoWeekLow: null,
    regularMarketTime: null,
    marketState: 'REGULAR'
  };

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export async function getHistoricalData(symbolRaw, timeframe = '1d') {
  const symbol = symbolRaw?.trim()?.toUpperCase();
  if (!symbol) {
    throw new Error('Invalid symbol provided');
  }

  if (!window.electronAPI || !window.electronAPI.fetchStockHistory) {
    throw new Error('IPC not available for stock history');
  }

  const cacheKey = getCacheKey(symbol, timeframe);
  const cached = cache.get(cacheKey);
  if (isCacheValid(cached)) return cached.data;

  let json;
  try {
    // We ignore range/interval on the main side; we down-sample here
    json = await window.electronAPI.fetchStockHistory({
      symbol,
      range: timeframe,
      interval: '1d'
    });
  } catch (err) {
    console.error('Error fetching history via IPC', err);
    const msg = err?.message || String(err);
    if (msg.includes('Network error')) {
      throw new Error('Network error: Unable to connect to stock data service');
    }
    throw new Error(msg);
  }

  const series = json?.['Time Series (Daily)'];
  if (!series) {
    const note = json?.Note || json?.['Error Message'];
    if (note && note.includes('call frequency')) {
      throw new Error('API limit reached. Please wait a minute and try again.');
    }
    throw new Error(`No historical data available for ${symbol}`);
  }

  // Alpha Vantage returns an object keyed by date string; sort by date
  const daysLimit = timeframeToDays(timeframe);
  const entries = Object.entries(series)
    .map(([dateStr, values]) => ({
      date: new Date(dateStr),
      price: parseFloat(values['4. close']),
      volume: parseInt(values['6. volume'], 10) || null
    }))
    .filter((d) => !isNaN(d.price))
    .sort((a, b) => a.date - b.date);

  let data = entries;
  if (Number.isFinite(daysLimit)) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysLimit);
    data = entries.filter((d) => d.date >= cutoff);
  }

  if (data.length === 0) {
    throw new Error(`No valid price data available for ${symbol}`);
  }

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export function clearCache() {
  cache.clear();
}

export function clearCache() {
  cache.clear();
}
