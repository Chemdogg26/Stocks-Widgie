import yahooFinance from 'yahoo-finance2';

// Cache for stock data to minimize API calls
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

function getCacheKey(symbol, timeframe) {
  return `${symbol}_${timeframe}`;
}

function isCacheValid(cacheEntry) {
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
}

export async function getStockQuote(symbol) {
  try {
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      throw new Error('Invalid symbol provided');
    }

    const cacheKey = getCacheKey(symbol.trim().toUpperCase(), 'quote');
    const cached = cache.get(cacheKey);
    
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }

    const quote = await yahooFinance.quote(symbol.trim().toUpperCase());
    
    if (!quote || !quote.symbol) {
      throw new Error(`Invalid symbol: ${symbol} not found`);
    }
    
    const data = {
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName || symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketPreviousClose: quote.regularMarketPreviousClose,
      regularMarketChange: quote.regularMarketChange,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      regularMarketOpen: quote.regularMarketOpen,
      regularMarketDayHigh: quote.regularMarketDayHigh,
      regularMarketDayLow: quote.regularMarketDayLow,
      marketCap: quote.marketCap,
      trailingPE: quote.trailingPE,
      dividendYield: quote.dividendYield,
      trailingAnnualDividendRate: quote.trailingAnnualDividendRate,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      regularMarketTime: quote.regularMarketTime,
      marketState: quote.marketState
    };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    
    // Provide more specific error messages
    if (error.message.includes('not found') || error.message.includes('Invalid symbol')) {
      throw new Error(`Invalid symbol: ${symbol} not found`);
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network error: Unable to connect to stock data service');
    }
    
    throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
  }
}

export async function getHistoricalData(symbol, timeframe = '1d') {
  try {
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      throw new Error('Invalid symbol provided');
    }

    const cacheKey = getCacheKey(symbol.trim().toUpperCase(), timeframe);
    const cached = cache.get(cacheKey);
    
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }

    const now = new Date();
    let startDate = new Date();
    let interval = '1m';

    // Determine date range and interval based on timeframe
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        interval = '1m';
        break;
      case '5d':
        startDate.setDate(now.getDate() - 5);
        interval = '5m';
        break;
      case '1mo':
        startDate.setMonth(now.getMonth() - 1);
        interval = '1h';
        break;
      case '6mo':
        startDate.setMonth(now.getMonth() - 6);
        interval = '1d';
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        interval = '1d';
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        interval = '1d';
        break;
      case '5y':
        startDate.setFullYear(now.getFullYear() - 5);
        interval = '1wk';
        break;
      case 'max':
        startDate = new Date(2000, 0, 1);
        interval = '1mo';
        break;
      default:
        startDate.setDate(now.getDate() - 1);
        interval = '1m';
    }

    const historical = await yahooFinance.historical(symbol.trim().toUpperCase(), {
      period1: startDate,
      period2: now,
      interval: interval
    });

    if (!historical || historical.length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }

    const data = historical.map(item => ({
      date: new Date(item.date),
      price: item.close || item.adjClose,
      volume: item.volume
    })).filter(item => item.price != null);

    if (data.length === 0) {
      throw new Error(`No valid price data available for ${symbol}`);
    }

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    
    // Provide more specific error messages
    if (error.message.includes('not found') || error.message.includes('Invalid symbol')) {
      throw new Error(`Invalid symbol: ${symbol} not found`);
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network error: Unable to connect to stock data service');
    }
    
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
  }
}

export function clearCache() {
  cache.clear();
}
