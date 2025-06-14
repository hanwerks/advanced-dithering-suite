import React, { useState, useEffect } from 'react';
import ColorSwatch from '../ColorSwatch/ColorSwatch';
import { COLOR_PALETTES } from '@algorithms';
import './ColorPalette.css';

/**
 * Enhanced Color Palette Component with Interactive Swatches
 * Based on color_palette.html reference implementation
 */
const ColorPalette = ({
  selectedPalette = 'monochrome',
  onPaletteChange = null,
  onCustomPaletteUpdate = null,
  allowCustomEditing = true,
  showControls = true,
  className = ''
}) => {
  const [customPalettes, setCustomPalettes] = useState({
    custom: [[0, 0, 0], [255, 255, 255]]
  });
  const [showPaletteOutput, setShowPaletteOutput] = useState(false);

  // Initialize custom palettes with defaults
  useEffect(() => {
    const initialCustomPalettes = { ...customPalettes };
    
    // Add editable versions of predefined palettes
    Object.entries(COLOR_PALETTES).forEach(([key, palette]) => {
      if (!initialCustomPalettes[key]) {
        initialCustomPalettes[key] = [...palette.colors.map(color => [...color])];
      }
    });
    
    setCustomPalettes(initialCustomPalettes);
  }, []);

  const getCurrentPalette = () => {
    if (customPalettes[selectedPalette]) {
      return customPalettes[selectedPalette];
    }
    return COLOR_PALETTES[selectedPalette]?.colors || COLOR_PALETTES.monochrome.colors;
  };

  const handlePaletteTypeChange = (e) => {
    const newPalette = e.target.value;
    if (onPaletteChange) {
      onPaletteChange(newPalette);
    }
  };

  const handleColorChange = (colorIndex, newColor) => {
    const updatedPalettes = { ...customPalettes };
    
    if (!updatedPalettes[selectedPalette]) {
      // Create editable copy if it doesn't exist
      const originalPalette = COLOR_PALETTES[selectedPalette]?.colors || COLOR_PALETTES.monochrome.colors;
      updatedPalettes[selectedPalette] = originalPalette.map(color => [...color]);
    }
    
    updatedPalettes[selectedPalette][colorIndex] = newColor;
    setCustomPalettes(updatedPalettes);
    
    if (onCustomPaletteUpdate) {
      onCustomPaletteUpdate(selectedPalette, updatedPalettes[selectedPalette]);
    }
  };

  const addColorToPalette = () => {
    const currentPalette = getCurrentPalette();
    if (currentPalette.length < 32) {
      const newColor = [128, 128, 128]; // Default gray
      handleColorChange(currentPalette.length, newColor);
    }
  };

  const removeColorFromPalette = () => {
    const currentPalette = getCurrentPalette();
    if (currentPalette.length > 1) {
      const updatedPalettes = { ...customPalettes };
      if (updatedPalettes[selectedPalette]) {
        updatedPalettes[selectedPalette] = updatedPalettes[selectedPalette].slice(0, -1);
        setCustomPalettes(updatedPalettes);
        
        if (onCustomPaletteUpdate) {
          onCustomPaletteUpdate(selectedPalette, updatedPalettes[selectedPalette]);
        }
      }
    }
  };

  const resetPalette = () => {
    const originalPalette = COLOR_PALETTES[selectedPalette]?.colors || COLOR_PALETTES.monochrome.colors;
    const updatedPalettes = { ...customPalettes };
    updatedPalettes[selectedPalette] = originalPalette.map(color => [...color]);
    setCustomPalettes(updatedPalettes);
    
    if (onCustomPaletteUpdate) {
      onCustomPaletteUpdate(selectedPalette, updatedPalettes[selectedPalette]);
    }
  };

  const currentPalette = getCurrentPalette();
  const isCustomEditable = allowCustomEditing && (selectedPalette === 'custom' || customPalettes[selectedPalette]);
  
  const paletteClasses = [
    'color-palette',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={paletteClasses}>
      {/* Palette Type Selector */}
      <div className="palette-selector">
        <label htmlFor="paletteType">Palette Type</label>
        <select
          id="paletteType"
          className="form-control"
          value={selectedPalette}
          onChange={handlePaletteTypeChange}
        >
          {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
            <option key={key} value={key}>{palette.name}</option>
          ))}
          <option value="custom">Custom Palette</option>
        </select>
      </div>

      {/* Color Swatches */}
      <div className="palette-preview">
        {currentPalette.map((color, index) => (
          <ColorSwatch
            key={`${selectedPalette}-${index}`}
            color={color}
            index={index}
            onColorChange={isCustomEditable ? handleColorChange : null}
            size="medium"
            showRGB={true}
            disabled={!isCustomEditable}
          />
        ))}
      </div>

      {/* Palette Controls */}
      {showControls && isCustomEditable && (
        <div className="palette-controls">
          <button
            className="btn btn-primary palette-btn"
            onClick={addColorToPalette}
            disabled={currentPalette.length >= 32}
            title="Add new color to palette"
          >
            + Add Color
          </button>
          <button
            className="btn btn-secondary palette-btn"
            onClick={removeColorFromPalette}
            disabled={currentPalette.length <= 1}
            title="Remove last color from palette"
          >
            - Remove
          </button>
          <button
            className="btn btn-secondary palette-btn"
            onClick={resetPalette}
            title="Reset palette to original colors"
          >
            🔄 Reset
          </button>
        </div>
      )}

      {/* Palette Info */}
      <div className="palette-info">
        <div className="palette-stats">
          <span className="stat">
            <strong>{currentPalette.length}</strong> colors
          </span>
          <span className="stat">
            <strong>{selectedPalette}</strong> palette
          </span>
          {isCustomEditable && (
            <span className="stat editable-indicator">
              ✏️ Editable
            </span>
          )}
        </div>
        
        {showControls && (
          <button
            className="btn btn-small btn-secondary"
            onClick={() => setShowPaletteOutput(!showPaletteOutput)}
          >
            {showPaletteOutput ? '📋 Hide' : '📋 Show'} Data
          </button>
        )}
      </div>

      {/* Palette Output */}
      {showPaletteOutput && (
        <div className="palette-output">
          <h4>Palette Data</h4>
          <pre className="palette-code">
            {JSON.stringify(currentPalette, null, 2)}
          </pre>
          <button
            className="btn btn-small btn-secondary copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(currentPalette, null, 2));
            }}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;