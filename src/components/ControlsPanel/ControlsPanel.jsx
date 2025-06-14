import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '@stores/appStore';
import { getAlgorithmsForCategory, getAlgorithmParameters } from '@algorithms';
import ColorPalette from '../ColorPalette/ColorPalette';
import './ControlsPanel.css';

/**
 * Main Controls Panel Component
 * Contains all dithering, noise, and processing controls
 * This is a temporary stub - will be expanded with extracted controls
 */
const ControlsPanel = () => {
  const { 
    setOriginalImage,
    setOriginalImageData,
    originalImageData,
    ditheringSettings,
    updateDitheringSettings,
    updatePaletteSettings,
    addDebugLog,
    resetSettings
  } = useAppStore();
  
  // Local state for algorithm parameters
  const [algorithmParameters, setAlgorithmParameters] = useState({});
  
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    addDebugLog(`Loading file: ${file.name} (${file.size} bytes)`, 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Set the original image for display
        setOriginalImage(e.target.result);
        
        // Create canvas to extract ImageData
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale down for performance while maintaining aspect ratio
        const maxSize = 800;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw and extract ImageData
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        setOriginalImageData(imageData);
        addDebugLog(`Image processed: ${canvas.width}×${canvas.height}`, 'success');
      };
      img.onerror = () => {
        addDebugLog('Failed to process image', 'error');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      addDebugLog('Failed to load image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    const algorithms = getAlgorithmsForCategory(category);
    const firstAlgorithm = Object.keys(algorithms)[0];
    
    updateDitheringSettings({ 
      category, 
      algorithm: firstAlgorithm,
      parameters: {} 
    });
    setAlgorithmParameters({});
    addDebugLog(`Algorithm category changed to: ${category}`, 'debug');
  };

  const handleAlgorithmChange = (event) => {
    const algorithm = event.target.value;
    updateDitheringSettings({ algorithm, parameters: {} });
    setAlgorithmParameters({});
    addDebugLog(`Dithering algorithm changed to: ${algorithm}`, 'debug');
  };

  const handlePaletteChange = (palette) => {
    updateDitheringSettings({ palette });
    addDebugLog(`Color palette changed to: ${palette}`, 'debug');
  };

  const handleCustomPaletteUpdate = (paletteKey, colors) => {
    // Store custom palette data directly in dithering settings
    const updatedCustomPalettes = {
      ...ditheringSettings.customPalettes,
      [paletteKey]: colors
    };
    
    updateDitheringSettings({ 
      customPalettes: updatedCustomPalettes
    });
    
    // Also update the separate palette settings for compatibility
    updatePaletteSettings({ 
      type: paletteKey, 
      customPalette: colors,
      colors: colors 
    });
    
    addDebugLog(`Custom palette ${paletteKey} updated with ${colors.length} colors`, 'debug');
  };

  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...algorithmParameters, [paramName]: value };
    setAlgorithmParameters(newParameters);
    updateDitheringSettings({ parameters: newParameters });
    addDebugLog(`Parameter ${paramName} changed to: ${value}`, 'debug');
  };

  const handleStrengthChange = (event) => {
    const strength = parseFloat(event.target.value);
    updateDitheringSettings({ strength });
    addDebugLog(`Dithering strength changed to: ${strength}`, 'debug');
  };

  // Update algorithm parameters when algorithm changes
  useEffect(() => {
    const paramDefs = getAlgorithmParameters(ditheringSettings.category, ditheringSettings.algorithm);
    const defaultParams = {};
    Object.keys(paramDefs).forEach(key => {
      defaultParams[key] = paramDefs[key].default;
    });
    setAlgorithmParameters(defaultParams);
  }, [ditheringSettings.category, ditheringSettings.algorithm]);

  // Get current algorithm info
  const currentAlgorithms = getAlgorithmsForCategory(ditheringSettings.category);
  const currentAlgorithmInfo = currentAlgorithms[ditheringSettings.algorithm];
  const currentParameters = getAlgorithmParameters(ditheringSettings.category, ditheringSettings.algorithm);

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

      {/* Algorithm Selection */}
      <div className="control-section">
        <h3 className="section-title">🎨 Algorithm Selection</h3>
        
        <div className="control-group">
          <label htmlFor="category">Algorithm Category</label>
          <select
            id="category"
            className="form-control"
            value={ditheringSettings.category}
            onChange={handleCategoryChange}
          >
            <option value="error-diffusion">Error Diffusion</option>
            <option value="ordered">Ordered Dithering</option>
            <option value="specialized">Specialized Techniques</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="algorithm">Specific Algorithm</label>
          <select
            id="algorithm"
            className="form-control"
            value={ditheringSettings.algorithm}
            onChange={handleAlgorithmChange}
          >
            {Object.entries(currentAlgorithms).map(([key, algo]) => (
              <option key={key} value={key}>{algo.name}</option>
            ))}
          </select>
          {currentAlgorithmInfo && (
            <div className="algorithm-description">
              {currentAlgorithmInfo.description}
            </div>
          )}
        </div>

        <div className="control-group">
          <label htmlFor="strength">
            Dithering Strength: {ditheringSettings.strength.toFixed(1)}
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

        {/* Algorithm-specific parameters */}
        {Object.entries(currentParameters).map(([paramKey, param]) => (
          <div key={paramKey} className="control-group">
            <label htmlFor={paramKey}>
              {param.label}: {algorithmParameters[paramKey]?.toFixed?.(param.step < 1 ? 1 : 0) || algorithmParameters[paramKey]}
            </label>
            <input
              id={paramKey}
              type="range"
              className="range-slider"
              min={param.min}
              max={param.max}
              step={param.step || 0.1}
              value={algorithmParameters[paramKey] || param.default}
              onChange={(e) => handleParameterChange(paramKey, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Color Palette */}
      <div className="control-section">
        <h3 className="section-title">🎭 Color Palette</h3>
        
        <ColorPalette
          selectedPalette={ditheringSettings.palette}
          onPaletteChange={handlePaletteChange}
          onCustomPaletteUpdate={handleCustomPaletteUpdate}
          allowCustomEditing={true}
          showControls={true}
        />
      </div>

      {/* Live Processing Indicator */}
      {originalImageData && (
        <div className="control-section">
          <div className="live-processing-indicator">
            ✨ Live Processing Active
          </div>
          <p className="live-description">
            Changes are applied automatically as you adjust settings
          </p>
        </div>
      )}

      {/* Download Button */}
      <div className="control-section">
        <button 
          className="btn btn-large btn-secondary download-btn" 
          disabled={!originalImageData}
          onClick={() => {
            // This will be implemented when connecting to the result canvas
            addDebugLog('Download functionality will be implemented', 'info');
          }}
        >
          💾 Download Result
        </button>
      </div>
    </aside>
  );
};

export default ControlsPanel;