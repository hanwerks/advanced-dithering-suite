/**
 * Ordered Dithering Algorithms
 * Based on advanced_dithering_algorithms.html implementation
 */

export const ORDERED_DITHERING_ALGORITHMS = {
  'bayer-4x4': {
    name: 'Bayer 4×4',
    description: 'Classic ordered dithering pattern',
    type: 'bayer',
    size: 4,
    parameters: {}
  },
  'bayer-8x8': {
    name: 'Large Bayer 8×8',
    description: 'Fine pattern details with higher resolution',
    type: 'bayer',
    size: 8,
    parameters: {}
  },
  'blue-noise': {
    name: 'Blue Noise',
    description: 'Natural, organic patterns that mimic film grain',
    type: 'blue-noise',
    parameters: {
      'frequency': { min: 0.1, max: 2.0, default: 1.0, label: 'Noise Frequency' },
      'amplitude': { min: 0.1, max: 2.0, default: 1.0, label: 'Pattern Amplitude' }
    }
  },
  'void-cluster': {
    name: 'Void-and-Cluster',
    description: 'Organic dot formation with natural clustering',
    type: 'void-cluster',
    parameters: {
      'cluster-size': { min: 2, max: 16, default: 8, label: 'Cluster Size' }
    }
  },
  'clustered-dot': {
    name: 'Clustered Dot',
    description: 'Traditional print halftones for vintage aesthetic',
    type: 'clustered',
    parameters: {
      'dot-size': { min: 2, max: 12, default: 6, label: 'Dot Size' }
    }
  }
};

export function generateBayerMatrix(size) {
  if (size === 2) {
    return [[0, 2], [3, 1]];
  }
  
  const half = size / 2;
  const smaller = generateBayerMatrix(half);
  const matrix = Array(size).fill().map(() => Array(size).fill(0));
  
  for (let y = 0; y < half; y++) {
    for (let x = 0; x < half; x++) {
      const base = smaller[y][x] * 4;
      matrix[y][x] = base;
      matrix[y][x + half] = base + 2;
      matrix[y + half][x] = base + 3;
      matrix[y + half][x + half] = base + 1;
    }
  }
  return matrix;
}

export function generateBlueNoiseMatrix(size, frequency = 1.0, amplitude = 1.0) {
  const matrix = Array(size).fill().map(() => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise1 = Math.random();
      const noise2 = Math.random();
      const blueNoise = Math.sin(x * frequency + noise1 * Math.PI) * Math.cos(y * frequency + noise2 * Math.PI);
      matrix[y][x] = Math.floor((blueNoise * amplitude + 1) * 0.5 * size * size);
    }
  }
  return matrix;
}

export function generateVoidClusterMatrix(size, clusterSize = 8) {
  const matrix = Array(size).fill().map(() => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const centerX = size / 2;
      const centerY = size / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const clusterValue = Math.sin(distance * Math.PI / clusterSize) * 0.5 + 0.5;
      matrix[y][x] = Math.floor(clusterValue * size * size);
    }
  }
  return matrix;
}

export function generateClusteredDotMatrix(size, dotSize = 6) {
  const matrix = Array(size).fill().map(() => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size/2;
      const dy = y - size/2;
      const distance = Math.sqrt(dx*dx + dy*dy);
      matrix[y][x] = Math.floor((distance % dotSize) / dotSize * size * size);
    }
  }
  return matrix;
}

export function applyOrderedDithering(imageData, algorithmKey, strength = 1.0, parameters = {}) {
  const algoData = ORDERED_DITHERING_ALGORITHMS[algorithmKey];
  if (!algoData) throw new Error(`Unknown ordered dithering algorithm: ${algorithmKey}`);
  
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  let matrix;
  switch (algoData.type) {
    case 'bayer':
      matrix = generateBayerMatrix(algoData.size);
      break;
    case 'blue-noise':
      matrix = generateBlueNoiseMatrix(8, 
        parameters.frequency || algoData.parameters.frequency?.default || 1.0,
        parameters.amplitude || algoData.parameters.amplitude?.default || 1.0
      );
      break;
    case 'void-cluster':
      matrix = generateVoidClusterMatrix(8, 
        parameters['cluster-size'] || algoData.parameters['cluster-size']?.default || 8
      );
      break;
    case 'clustered':
      matrix = generateClusteredDotMatrix(8,
        parameters['dot-size'] || algoData.parameters['dot-size']?.default || 6
      );
      break;
    default:
      matrix = generateBayerMatrix(4);
  }

  const matrixSize = matrix.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      const threshold = (matrix[y % matrixSize][x % matrixSize] / (matrixSize * matrixSize)) * 255 * strength;
      const newValue = gray > threshold ? 255 : 0;
      
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
    }
  }
}