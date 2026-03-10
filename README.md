# Desktop Stock Widget

A native Windows desktop widget that displays live stock information with interactive charts. The widget cycles through a customizable list of stocks, showing each for a configurable duration.

## Features

- **Live Stock Data**: Real-time stock quotes and historical data from Yahoo Finance
- **Interactive Charts**: Multiple timeframe views (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, Max)
- **Auto-Rotation**: Automatically cycles through your stock list
- **Customizable**: Add/remove stocks and adjust rotation duration
- **Always on Top**: Stays visible on your desktop
- **Transparent Window**: Adjustable opacity and click-through support
- **Dark Theme**: Modern dark UI matching financial data displays

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run electron:dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm run dist
   ```

## Usage

1. Launch the application
2. Click the settings button (⚙️) to customize:
   - Add/remove stock symbols
   - Adjust rotation duration (default: 30 seconds)
   - Change window opacity
   - Enable/disable click-through mode

3. The widget will automatically cycle through your stock list

## Default Settings

- Stock list: AAPL, GOOGL, MSFT, AMZN, TSLA
- Rotation duration: 30 seconds
- Window opacity: 95%
- Click-through: Disabled

## Technology Stack

- **Electron** - Desktop application framework
- **React** - UI framework
- **Vite** - Build tool
- **Recharts** - Chart visualization
- **yahoo-finance2** - Stock data API
- **electron-store** - Settings persistence

## Requirements

- Node.js 18+ 
- Windows 10/11 (or macOS/Linux for cross-platform support)

## Notes

- Stock data is fetched from Yahoo Finance API (free, no API key required)
- Data is cached for 1 minute to minimize API calls
- The widget refreshes stock data every 30 seconds
- Invalid stock symbols will show an error message

## License

MIT
