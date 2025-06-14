import React, { useRef } from 'react';
import { useAppStore } from '@stores/appStore';
import './ControlsPanel.css';

/**
 * Main Controls Panel Component
 * Contains all dithering, noise, and processing controls
 * This is a temporary stub - will be expanded with extracted controls
 */
const ControlsPanel = () => {
  const { 
    setOriginalImage,
    ditheringSettings,
    updateDitheringSettings,
    addDebugLog,
    resetSettings
  } = useAppStore();
  
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    addDebugLog(`Loading file: ${file.name} (${file.size} bytes)`, 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      addDebugLog('Image loaded successfully', 'success');
    };
    reader.onerror = () => {
      addDebugLog('Failed to load image', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleAlgorithmChange = (event) => {
    const algorithm = event.target.value;
    updateDitheringSettings({ algorithm });
    addDebugLog(`Dithering algorithm changed to: ${algorithm}`, 'debug');
  };

  const handleStrengthChange = (event) => {
    const strength = parseFloat(event.target.value);
    updateDitheringSettings({ strength });
    addDebugLog(`Dithering strength changed to: ${strength}`, 'debug');
  };

  return (
    <aside className="controls-panel">
      <div className="panel-header">
        <h2>Controls</h2>
        <button 
          className="btn btn-small btn-secondary"
          onClick={resetSettings}
          title="Reset all settings to defaults"
        >
          🔄 Reset
        </button>
      </div>

      {/* Image Input Section */}
      <div className="control-section">
        <h3 className="section-title">📁 Image Input</h3>
        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="file-input"
            id="imageInput"
          />
          <label htmlFor="imageInput" className="file-label btn btn-primary">
            Choose Source Image
          </label>
        </div>
      </div>

      {/* Dithering Controls - Basic Implementation */}
      <div className="control-section">
        <h3 className="section-title">🎨 Dithering</h3>
        
        <div className="control-group">
          <label htmlFor="algorithm">Algorithm</label>
          <select
            id="algorithm"
            className="form-control"
            value={ditheringSettings.algorithm}
            onChange={handleAlgorithmChange}
          >
            <option value="floyd-steinberg">Floyd-Steinberg</option>
            <option value="ordered">Ordered (Bayer 4×4)</option>
            <option value="atkinson">Atkinson</option>
            <option value="burkes">Burkes</option>
            <option value="sierra">Sierra</option>
            <option value="sierra-lite">Sierra Lite</option>
            <option value="stucki">Stucki</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="strength">
            Strength: {ditheringSettings.strength.toFixed(1)}
          </label>
          <input
            id="strength"
            type="range"
            className="range-slider"
            min="0.1"
            max="3.0"
            step="0.1"
            value={ditheringSettings.strength}
            onChange={handleStrengthChange}
          />
        </div>
      </div>

      {/* Placeholder sections for future expansion */}
      <div className="control-section">
        <h3 className="section-title">🖼️ Posterization</h3>
        <div className="placeholder-content">
          <p>Posterization controls will be added here</p>
        </div>
      </div>

      <div className="control-section">
        <h3 className="section-title">🌊 Noise</h3>
        <div className="placeholder-content">
          <p>Noise controls will be added here</p>
        </div>
      </div>

      <div className="control-section">
        <h3 className="section-title">🎨 Palette</h3>
        <div className="placeholder-content">
          <p>Color palette controls will be added here</p>
        </div>
      </div>

      {/* Process Button */}
      <div className="control-section">
        <button className="btn btn-large btn-primary process-btn">
          ⚡ Process Image
        </button>
      </div>

      {/* Download Button */}
      <div className="control-section">
        <button className="btn btn-large btn-secondary download-btn" disabled>
          💾 Download Result
        </button>
      </div>
    </aside>
  );
};

export default ControlsPanel;