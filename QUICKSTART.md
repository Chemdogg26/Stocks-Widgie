# Quick Start Guide

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development Mode**
   ```bash
   npm run electron:dev
   ```
   This will start the Vite dev server and launch Electron.

## Building for Production

1. **Build the React App**
   ```bash
   npm run build
   ```

2. **Create Windows Installer**
   ```bash
   npm run dist
   ```
   The installer will be in the `dist` folder.

## Usage Tips

- **Add Stocks**: Click the ⚙️ settings button, enter a stock symbol (e.g., AAPL, GOOGL), and click Add
- **Adjust Rotation**: In settings, change the "Rotation Duration" (minimum 5 seconds)
- **Window Opacity**: Use the slider in settings to adjust transparency
- **Click-Through**: Enable this if you want the widget to not capture mouse clicks
- **Move Window**: Click and drag anywhere on the widget to move it

## Troubleshooting

- **No stock data**: Check your internet connection and verify the stock symbol is correct
- **Window not visible**: Check if it's behind other windows (it should be always-on-top)
- **Can't interact**: Make sure click-through is disabled in settings
