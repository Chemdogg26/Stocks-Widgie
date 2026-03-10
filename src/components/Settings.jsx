import { useState, useEffect } from 'react';
import './Settings.css';

function Settings({ settings, onClose, onSave }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleAddStock = () => {
    const symbol = newStock.trim().toUpperCase();
    if (!symbol) {
      alert('Please enter a stock symbol');
      return;
    }
    if (symbol.length > 10) {
      alert('Stock symbol is too long. Please enter a valid symbol.');
      return;
    }
    if (localSettings.stocks.includes(symbol)) {
      alert('This stock is already in your list');
      return;
    }
    setLocalSettings({
      ...localSettings,
      stocks: [...localSettings.stocks, symbol]
    });
    setNewStock('');
  };

  const handleRemoveStock = (symbol) => {
    setLocalSettings({
      ...localSettings,
      stocks: localSettings.stocks.filter(s => s !== symbol)
    });
  };

  const handleSave = () => {
    if (localSettings.stocks.length === 0) {
      alert('Please add at least one stock symbol');
      return;
    }
    if (localSettings.rotationDuration < 5) {
      alert('Rotation duration must be at least 5 seconds');
      return;
    }
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label className="settings-label">Stock List</label>
            <div className="stock-list">
              {localSettings.stocks.map((symbol) => (
                <div key={symbol} className="stock-item">
                  <span>{symbol}</span>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveStock(symbol)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="add-stock">
              <input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
                maxLength={10}
              />
              <button onClick={handleAddStock}>Add</button>
            </div>
          </div>

          <div className="settings-section">
            <label className="settings-label">
              Rotation Duration (seconds)
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={localSettings.rotationDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  rotationDuration: parseInt(e.target.value) || 30
                })
              }
            />
          </div>

          <div className="settings-section">
            <label className="settings-label">
              Window Opacity: {Math.round(localSettings.windowOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={localSettings.windowOpacity}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  windowOpacity: parseFloat(e.target.value)
                })
              }
            />
          </div>

          <div className="settings-section">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.clickThrough}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    clickThrough: e.target.checked
                  })
                }
              />
              Enable Click-Through (widget won't capture mouse clicks)
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
