/**
 * Specialized Dithering Algorithms
 * Based on advanced_dithering_algorithms.html implementation
 */

export const SPECIALIZED_DITHERING_ALGORITHMS = {
  'riemersma': {
    name: 'Riemersma Dithering',
    description: 'Space-filling curve patterns for unique aesthetics',
    type: 'riemersma',
    parameters: {
      'curve-order': { min: 2, max: 6, default: 4, label: 'Curve Complexity' }
    }
  },
  'threshold-modulation': {
    name: 'Threshold Modulation',
    description: 'Dynamic adaptive thresholds based on local content',
    type: 'threshold-mod',
    parameters: {
      'adaptation': { min: 0.1, max: 2.0, default: 1.0, label: 'Adaptation Strength' },
      'locality': { min: 1, max: 5, default: 3, label: 'Local Window Size' }
    }
  },
  'interleaved-gradient': {
    name: 'Interleaved Gradient',
    description: 'Multi-algorithm combination for complex patterns',
    type: 'interleaved',
    parameters: {
      'blend-ratio': { min: 0.0, max: 1.0, default: 0.5, label: 'Algorithm Blend Ratio' }
    }
  },
  'edge-aware': {
    name: 'Edge-Aware Hybrid',
    description: 'Content-adaptive processing preserving details',
    type: 'edge-aware',
    parameters: {
      'edge-threshold': { min: 10, max: 100, default: 50, label: 'Edge Detection Threshold' },
      'preservation': { min: 0.0, max: 1.0, default: 0.7, label: 'Detail Preservation' }
    }
  },
  'pattern-based': {
    name: 'Pattern-Based Hybrid',
    description: 'Combines multiple patterns for artistic effects',
    type: 'pattern-hybrid',
    parameters: {
      'pattern-mix': { min: 0.0, max: 1.0, default: 0.5, label: 'Pattern Mix Ratio' }
    }
  }
};

function generateHilbertCurve(size, order) {
  const points = [];
  const actualOrder = Math.min(order, Math.floor(Math.log2(size)));
  
  for (let i = 0; i < size * size; i++) {
    const point = hilbertIndexToPoint(i, actualOrder);
    points.push({ x: point.x / size, y: point.y / size });
  }
  return points;
}

function hilbertIndexToPoint(index, order) {
  let x = 0, y = 0;
  let s = 1;
  
  for (let i = 0; i < order; i++) {
    const rx = 1 & (index >> 1);
    const ry = 1 & (index ^ rx);
    
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      [x, y] = [y, x];
    }
    
    x += s * rx;
    y += s * ry;
    index >>= 2;
    s *= 2;
  }
  
  return { x, y };
}

function calculateLocalVariance(data, x, y, width, height, windowSize) {
  let sum = 0;
  let count = 0;
  const half = Math.floor(windowSize / 2);
  
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        sum += gray;
        count++;
      }
    }
  }
  
  return count > 0 ? (sum / count) / 255 : 0.5;
}

export function applyRiemersmaDithering(imageData, strength = 1.0, curveOrder = 4) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  const hilbertCurve = generateHilbertCurve(Math.min(width, height), curveOrder);
  
  for (let i = 0; i < hilbertCurve.length && i < width * height; i++) {
    const point = hilbertCurve[i];
    const x = Math.floor(point.x * width);
    const y = Math.floor(point.y * height);
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      const threshold = 128 + (Math.sin(i * 0.1) * 50 * strength);
      const newValue = gray > threshold ? 255 : 0;
      
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
    }
  }
}

export function applyThresholdModulation(imageData, strength = 1.0, adaptation = 1.0, locality = 3) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      const localVariance = calculateLocalVariance(data, x, y, width, height, locality);
      const adaptiveThreshold = 128 + (localVariance - 0.5) * 100 * adaptation * strength;
      
      const newValue = gray > adaptiveThreshold ? 255 : 0;
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
    }
  }
}

export function applyInterleavedGradient(imageData, strength = 1.0, blendRatio = 0.5) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      let newValue;
      if (Math.random() < blendRatio) {
        // Use ordered dithering
        const threshold = ((x % 4) * 4 + (y % 4)) * 16 * strength;
        newValue = gray > threshold ? 255 : 0;
      } else {
        // Use simple threshold with noise
        const noisyThreshold = 128 + (Math.random() - 0.5) * 50 * strength;
        newValue = gray > noisyThreshold ? 255 : 0;
      }
      
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
    }
  }
}

export function applyEdgeAwareDithering(imageData, strength = 1.0, edgeThreshold = 50, preservation = 0.7) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // First pass: detect edges
  const edges = new Array(width * height).fill(0);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // const idx = (y * width + x) * 4;
      
      // Sobel edge detection
      const gx = -data[((y-1)*width+(x-1))*4] + data[((y-1)*width+(x+1))*4] +
                -2*data[(y*width+(x-1))*4] + 2*data[(y*width+(x+1))*4] +
                -data[((y+1)*width+(x-1))*4] + data[((y+1)*width+(x+1))*4];
      
      const gy = -data[((y-1)*width+(x-1))*4] - 2*data[((y-1)*width+x)*4] - data[((y-1)*width+(x+1))*4] +
                 data[((y+1)*width+(x-1))*4] + 2*data[((y+1)*width+x)*4] + data[((y+1)*width+(x+1))*4];
      
      edges[y * width + x] = Math.sqrt(gx*gx + gy*gy) > edgeThreshold ? 1 : 0;
    }
  }

  // Second pass: apply appropriate dithering
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      let newValue;
      if (edges[y * width + x]) {
        // Use simple threshold for edges to preserve detail
        const edgeThreshold = 128 + (gray - 128) * preservation;
        newValue = gray > edgeThreshold ? 255 : 0;
      } else {
        // Use ordered dithering for smooth areas
        const threshold = ((x % 4) * 4 + (y % 4)) * 16 * strength;
        newValue = gray > threshold ? 255 : 0;
      }
      
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
    }
  }
}

export function applyPatternBasedHybrid(imageData, strength = 1.0, patternMix = 0.5) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      
      let threshold;
      if ((x + y) % 8 < 4 * patternMix) {
        // Bayer pattern
        threshold = ((x % 4) * 4 + (y % 4)) * 16;
      } else {
        // Blue noise approximation
        threshold = (Math.sin(x * 0.5) * Math.cos(y * 0.7) + 1) * 127.5;
      }
      
      threshold *= strength;
      const newValue = gray > threshold ? 255 : 0;
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
    }
  }
}

export function applySpecializedDithering(imageData, algorithmKey, strength = 1.0, parameters = {}) {
  const algoData = SPECIALIZED_DITHERING_ALGORITHMS[algorithmKey];
  if (!algoData) throw new Error(`Unknown specialized dithering algorithm: ${algorithmKey}`);
  
  switch (algoData.type) {
    case 'riemersma':
      applyRiemersmaDithering(imageData, strength, 
        parameters['curve-order'] || algoData.parameters['curve-order']?.default || 4
      );
      break;
    case 'threshold-mod':
      applyThresholdModulation(imageData, strength,
        parameters['adaptation'] || algoData.parameters['adaptation']?.default || 1.0,
        parameters['locality'] || algoData.parameters['locality']?.default || 3
      );
      break;
    case 'interleaved':
      applyInterleavedGradient(imageData, strength,
        parameters['blend-ratio'] || algoData.parameters['blend-ratio']?.default || 0.5
      );
      break;
    case 'edge-aware':
      applyEdgeAwareDithering(imageData, strength,
        parameters['edge-threshold'] || algoData.parameters['edge-threshold']?.default || 50,
        parameters['preservation'] || algoData.parameters['preservation']?.default || 0.7
      );
      break;
    case 'pattern-hybrid':
      applyPatternBasedHybrid(imageData, strength,
        parameters['pattern-mix'] || algoData.parameters['pattern-mix']?.default || 0.5
      );
      break;
  }
}