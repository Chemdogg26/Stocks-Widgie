import { useState, useEffect } from 'react';
import StockDisplay from './components/StockDisplay';
import Settings from './components/Settings';

function App() {
  const [settings, setSettings] = useState({
    stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
    rotationDuration: 30,
    windowOpacity: 0.95,
    clickThrough: false
  });
  const [currentStockIndex, setCurrentStockIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load settings from electron-store
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((loadedSettings) => {
        setSettings(loadedSettings);
      });
    }
  }, []);

  useEffect(() => {
    if (settings.stocks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStockIndex((prev) => (prev + 1) % settings.stocks.length);
    }, settings.rotationDuration * 1000);

    return () => clearInterval(interval);
  }, [settings.stocks, settings.rotationDuration]);

  const handleSettingsChange = async (newSettings) => {
    setSettings(newSettings);
    if (window.electronAPI) {
      await window.electronAPI.setSettings(newSettings);
      if (newSettings.windowOpacity !== settings.windowOpacity) {
        await window.electronAPI.setWindowOpacity(newSettings.windowOpacity);
      }
      if (newSettings.clickThrough !== settings.clickThrough) {
        await window.electronAPI.setClickThrough(newSettings.clickThrough);
      }
    }
  };

  const currentStock = settings.stocks[currentStockIndex];

  return (
    <div className="app">
      {currentStock && (
        <StockDisplay 
          symbol={currentStock} 
          onSettingsClick={() => setShowSettings(true)}
        />
      )}
      {showSettings && (
        <Settings
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsChange}
        />
      )}
    </div>
  );
}

export default App;
