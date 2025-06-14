import React, { useState } from 'react';
import './ColorSwatch.css';

const ColorSwatch = ({
  color = [255, 255, 255],
  index = 0,
  onColorChange = null,
  size = 'medium',
  showRGB = true,
  disabled = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingColor, setEditingColor] = useState(color);

  const handleSwatchClick = () => {
    if (disabled || !onColorChange) return;
    setEditingColor([...color]);
    setIsEditing(true);
  };

  const handleColorSave = () => {
    if (onColorChange) {
      onColorChange(index, editingColor);
    }
    setIsEditing(false);
  };

  const handleColorCancel = () => {
    setEditingColor([...color]);
    setIsEditing(false);
  };

  const updateColor = (component, value) => {
    const newColor = [...editingColor];
    newColor[component] = Math.max(0, Math.min(255, parseInt(value) || 0));
    setEditingColor(newColor);
  };

  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  const handleHexChange = (hexValue) => {
    const rgb = hexToRgb(hexValue);
    if (rgb) {
      setEditingColor(rgb);
    }
  };

  const handleColorPickerChange = (e) => {
    const rgb = hexToRgb(e.target.value);
    if (rgb) {
      setEditingColor(rgb);
    }
  };

  const rgbString = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  const hexString = rgbToHex(color[0], color[1], color[2]);
  const editingRgbString = `rgb(${editingColor[0]}, ${editingColor[1]}, ${editingColor[2]})`;
  const editingHexString = rgbToHex(editingColor[0], editingColor[1], editingColor[2]);

  const swatchClasses = [
    'color-swatch',
    `color-swatch--${size}`,
    disabled ? 'color-swatch--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <div 
        className={swatchClasses}
        style={{ backgroundColor: rgbString }}
        onClick={handleSwatchClick}
        title={disabled ? 'Color editing disabled' : `Click to edit ${hexString}`}
      >
        {showRGB && (
          <span className="color-swatch__text">
            {color[0]}, {color[1]}, {color[2]}
          </span>
        )}
      </div>

      {isEditing && (
        <div className="color-editor-modal" onClick={(e) => {
          if (e.target.classList.contains('color-editor-modal')) {
            handleColorCancel();
          }
        }}>
          <div className="color-editor-content">
            <h3>Edit Color #{index + 1}</h3>
            
            <div 
              className="color-preview"
              style={{ backgroundColor: editingRgbString }}
            >
              RGB({editingColor[0]}, {editingColor[1]}, {editingColor[2]})
            </div>
            
            <div className="color-picker-container">
              <label>Quick Color Picker:</label>
              <div className="color-picker-row">
                <input 
                  type="color" 
                  value={editingHexString}
                  onChange={handleColorPickerChange}
                  className="color-picker-input"
                />
                <input 
                  type="text" 
                  value={editingHexString}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="hex-input"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            
            <div className="color-input-group">
              <label>Red (0-255):</label>
              <div className="color-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="255" 
                  value={editingColor[0]}
                  onChange={(e) => updateColor(0, e.target.value)}
                  className="color-slider color-slider--red"
                />
                <input 
                  type="number" 
                  min="0" 
                  max="255" 
                  value={editingColor[0]}
                  onChange={(e) => updateColor(0, e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
            
            <div className="color-input-group">
              <label>Green (0-255):</label>
              <div className="color-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="255" 
                  value={editingColor[1]}
                  onChange={(e) => updateColor(1, e.target.value)}
                  className="color-slider color-slider--green"
                />
                <input 
                  type="number" 
                  min="0" 
                  max="255" 
                  value={editingColor[1]}
                  onChange={(e) => updateColor(1, e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
            
            <div className="color-input-group">
              <label>Blue (0-255):</label>
              <div className="color-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="255" 
                  value={editingColor[2]}
                  onChange={(e) => updateColor(2, e.target.value)}
                  className="color-slider color-slider--blue"
                />
                <input 
                  type="number" 
                  min="0" 
                  max="255" 
                  value={editingColor[2]}
                  onChange={(e) => updateColor(2, e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
            
            <div className="color-editor-buttons">
              <button 
                onClick={handleColorSave}
                className="btn btn-primary color-editor-btn"
              >
                Save Color
              </button>
              <button 
                onClick={handleColorCancel}
                className="btn btn-secondary color-editor-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColorSwatch;