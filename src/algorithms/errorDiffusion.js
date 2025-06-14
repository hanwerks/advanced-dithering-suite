/**
 * Error Diffusion Dithering Algorithms
 * Based on advanced_dithering_algorithms.html implementation
 */

export const ERROR_DIFFUSION_ALGORITHMS = {
  'floyd-steinberg': {
    name: 'Floyd-Steinberg',
    description: 'Classic error diffusion with excellent quality',
    kernel: [
      [0, 0, 7],
      [3, 5, 1]
    ],
    divisor: 16,
    parameters: {}
  },
  'jarvis-judice-ninke': {
    name: 'Jarvis-Judice-Ninke',
    description: 'Large 5×3 kernel for smooth gradients and superior quality',
    kernel: [
      [0, 0, 0, 7, 5],
      [3, 5, 7, 5, 3],
      [1, 3, 5, 3, 1]
    ],
    divisor: 48,
    parameters: {}
  },
  'stevenson-arce': {
    name: 'Stevenson-Arce',
    description: 'Optimized for color accuracy and smooth transitions',
    kernel: [
      [0, 0, 0, 0, 0, 32, 0],
      [12, 0, 26, 30, 16, 0, 0],
      [0, 12, 26, 12, 0, 0, 0],
      [5, 12, 12, 5, 0, 0, 0]
    ],
    divisor: 200,
    parameters: {}
  },
  'fan': {
    name: 'Fan Dithering',
    description: 'Speed-optimized algorithm with good quality balance',
    kernel: [
      [0, 0, 0, 7],
      [1, 3, 5, 0]
    ],
    divisor: 16,
    parameters: {}
  },
  'two-row-sierra': {
    name: 'Two-Row Sierra',
    description: 'Memory efficient processing with reduced artifacts',
    kernel: [
      [0, 0, 0, 4, 3],
      [1, 2, 3, 2, 1]
    ],
    divisor: 16,
    parameters: {}
  },
  'atkinson': {
    name: 'Atkinson',
    description: 'Apple\'s algorithm with unique aesthetic qualities',
    kernel: [
      [0, 0, 1, 1],
      [1, 1, 1, 0],
      [0, 1, 0, 0]
    ],
    divisor: 8,
    parameters: {}
  }
};

export function applyErrorDiffusion(imageData, algorithmKey, strength = 1.0) {
  const algoData = ERROR_DIFFUSION_ALGORITHMS[algorithmKey];
  if (!algoData) throw new Error(`Unknown error diffusion algorithm: ${algorithmKey}`);
  
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const kernel = algoData.kernel;
  const divisor = algoData.divisor;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Convert to grayscale
      const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      const newValue = gray < 128 ? 0 : 255;
      const error = (gray - newValue) * strength;
      
      // Set pixel
      data[idx] = data[idx + 1] = data[idx + 2] = newValue;
      
      // Distribute error using kernel
      for (let ky = 0; ky < kernel.length; ky++) {
        for (let kx = 0; kx < kernel[ky].length; kx++) {
          const weight = kernel[ky][kx];
          if (weight === 0) continue;
          
          const ny = y + ky;
          const nx = x + kx - Math.floor(kernel[ky].length / 2);
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = (ny * width + nx) * 4;
            const errorAmount = (error * weight) / divisor;
            
            data[nidx] = Math.max(0, Math.min(255, data[nidx] + errorAmount));
            data[nidx + 1] = Math.max(0, Math.min(255, data[nidx + 1] + errorAmount));
            data[nidx + 2] = Math.max(0, Math.min(255, data[nidx + 2] + errorAmount));
          }
        }
      }
    }
  }
}