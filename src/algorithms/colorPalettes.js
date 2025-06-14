/**
 * Color Palettes for Dithering
 * Based on advanced_dithering_algorithms.html implementation
 */

export const COLOR_PALETTES = {
  'monochrome': {
    name: 'Monochrome (B&W)',
    colors: [[0, 0, 0], [255, 255, 255]]
  },
  'grayscale-4': {
    name: '4-Level Grayscale',
    colors: [[0, 0, 0], [85, 85, 85], [170, 170, 170], [255, 255, 255]]
  },
  'gameboy': {
    name: 'Game Boy Green',
    colors: [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]]
  },
  'sepia': {
    name: 'Sepia Tones',
    colors: [[44, 35, 26], [92, 70, 48], [162, 132, 94], [210, 180, 140]]
  },
  'cga': {
    name: 'CGA (4 colors)',
    colors: [[0, 0, 0], [255, 0, 255], [0, 255, 255], [255, 255, 255]]
  },
  'custom-8': {
    name: '8 Colors',
    colors: [
      [0, 0, 0], [255, 255, 255], [255, 0, 0], [0, 255, 0],
      [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255]
    ]
  },
  'custom-16': {
    name: '16 Colors',
    colors: [
      [0, 0, 0], [128, 128, 128], [192, 192, 192], [255, 255, 255],
      [128, 0, 0], [255, 0, 0], [128, 128, 0], [255, 255, 0],
      [0, 128, 0], [0, 255, 0], [0, 128, 128], [0, 255, 255],
      [0, 0, 128], [0, 0, 255], [128, 0, 128], [255, 0, 255]
    ]
  }
};

function colorDistance(color1, color2) {
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function findClosestColor(targetColor, palette) {
  let closestColor = palette[0];
  let minDistance = colorDistance(targetColor, palette[0]);
  
  for (let i = 1; i < palette.length; i++) {
    const distance = colorDistance(targetColor, palette[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = palette[i];
    }
  }
  
  return closestColor;
}

export function applyColorPalette(imageData, paletteKey, customPalettes = null) {
  let palette;
  
  // First check for custom palette data
  if (customPalettes && customPalettes[paletteKey]) {
    palette = customPalettes[paletteKey];
  } else {
    // Fall back to static palette
    const paletteData = COLOR_PALETTES[paletteKey];
    if (!paletteData) throw new Error(`Unknown color palette: ${paletteKey}`);
    palette = paletteData.colors;
  }
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const closestColor = findClosestColor([r, g, b], palette);
    data[i] = closestColor[0];
    data[i + 1] = closestColor[1];
    data[i + 2] = closestColor[2];
  }
}