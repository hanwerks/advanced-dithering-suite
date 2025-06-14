/**
 * Advanced Dithering Algorithms - Main Export
 * Centralizes all dithering functionality
 */

import { 
  ERROR_DIFFUSION_ALGORITHMS, 
  applyErrorDiffusion 
} from './errorDiffusion.js';

import { 
  ORDERED_DITHERING_ALGORITHMS, 
  applyOrderedDithering 
} from './orderedDithering.js';

import { 
  SPECIALIZED_DITHERING_ALGORITHMS, 
  applySpecializedDithering 
} from './specializedDithering.js';

import { 
  COLOR_PALETTES, 
  applyColorPalette 
} from './colorPalettes.js';

// Combine all algorithms into categories
export const DITHERING_ALGORITHMS = {
  'error-diffusion': ERROR_DIFFUSION_ALGORITHMS,
  'ordered': ORDERED_DITHERING_ALGORITHMS,
  'specialized': SPECIALIZED_DITHERING_ALGORITHMS
};

export { COLOR_PALETTES };

/**
 * Main dithering processor function
 * @param {ImageData} imageData - Canvas ImageData object
 * @param {string} category - Algorithm category ('error-diffusion', 'ordered', 'specialized')
 * @param {string} algorithm - Specific algorithm key
 * @param {number} strength - Dithering strength (0.1 - 3.0)
 * @param {Object} parameters - Algorithm-specific parameters
 * @param {string} paletteKey - Color palette to apply
 */
export async function processDithering(imageData, category, algorithm, strength = 1.0, parameters = {}, paletteKey = 'monochrome', customPalettes = null) {
  // Clone the image data to avoid mutating the original
  const processedImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Apply the selected dithering algorithm
  switch (category) {
    case 'error-diffusion':
      applyErrorDiffusion(processedImageData, algorithm, strength);
      break;
    case 'ordered':
      applyOrderedDithering(processedImageData, algorithm, strength, parameters);
      break;
    case 'specialized':
      applySpecializedDithering(processedImageData, algorithm, strength, parameters);
      break;
    default:
      throw new Error(`Unknown dithering category: ${category}`);
  }

  // Apply color palette
  applyColorPalette(processedImageData, paletteKey, customPalettes);

  return processedImageData;
}

/**
 * Get algorithm information for UI display
 * @param {string} category - Algorithm category
 * @param {string} algorithm - Algorithm key
 */
export function getAlgorithmInfo(category, algorithm) {
  const categoryData = DITHERING_ALGORITHMS[category];
  if (!categoryData) return null;
  
  return categoryData[algorithm] || null;
}

/**
 * Get all algorithms for a category
 * @param {string} category - Algorithm category
 */
export function getAlgorithmsForCategory(category) {
  return DITHERING_ALGORITHMS[category] || {};
}

/**
 * Get parameter definitions for an algorithm
 * @param {string} category - Algorithm category
 * @param {string} algorithm - Algorithm key
 */
export function getAlgorithmParameters(category, algorithm) {
  const algoInfo = getAlgorithmInfo(category, algorithm);
  return algoInfo?.parameters || {};
}