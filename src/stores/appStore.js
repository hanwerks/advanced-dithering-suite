import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Central application store for the Advanced Dithering Suite
 * Manages global state for images, settings, processing, and UI
 */
export const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // =========================
    // IMAGE STATE
    // =========================
    originalImage: null,
    processedImage: null,
    noiseImage: null,
    imageHistory: [],
    currentHistoryIndex: -1,
    
    // =========================
    // PROCESSING SETTINGS
    // =========================
    ditheringSettings: {
      algorithm: 'floyd-steinberg',
      strength: 1.0,
      matrix: null, // Custom error diffusion matrix
      orderingMatrix: null, // For ordered dithering
    },
    
    posterizationSettings: {
      mode: 'uniform',
      levels: 8,
      variation: 0.2,
      contrast: 1.0,
      brightness: 0,
    },
    
    noiseSettings: {
      source: 'perlin',
      scale: 0.05,
      intensity: 0.5,
      octaves: 3,
      blackValue: 0,
      whiteValue: 1,
      distortion: 0,
      blendMode: 'multiply',
    },
    
    paletteSettings: {
      type: 'monochrome',
      customPalette: [[0, 0, 0], [255, 255, 255]],
      colors: [],
    },
    
    artisticSettings: {
      painterlyShadows: false,
      organicEdges: false,
      colorBleed: false,
      textureStrength: 0.3,
    },
    
    // =========================
    // UI STATE
    // =========================
    ui: {
      activePanel: 'dithering',
      panelStates: {
        dithering: { collapsed: false },
        posterization: { collapsed: false },
        noise: { collapsed: false },
        palette: { collapsed: false },
        artistic: { collapsed: false },
      },
      showDebugConsole: false,
      processingStatus: 'idle', // 'idle', 'processing', 'complete', 'error'
      lastProcessingTime: null,
    },
    
    // =========================
    // PROCESSING STATE
    // =========================
    processing: {
      isProcessing: false,
      progress: 0,
      stage: '',
      error: null,
    },
    
    // =========================
    // DEBUG STATE
    // =========================
    debug: {
      logs: [],
      performanceMetrics: {},
      showTiming: false,
    },
    
    // =========================
    // ACTIONS
    // =========================
    
    // Image Actions
    setOriginalImage: (image) => set({ originalImage: image }),
    setProcessedImage: (image) => set({ processedImage: image }),
    setNoiseImage: (image) => set({ noiseImage: image }),
    
    // Settings Actions
    updateDitheringSettings: (updates) => set(state => ({
      ditheringSettings: { ...state.ditheringSettings, ...updates }
    })),
    
    updatePosterizationSettings: (updates) => set(state => ({
      posterizationSettings: { ...state.posterizationSettings, ...updates }
    })),
    
    updateNoiseSettings: (updates) => set(state => ({
      noiseSettings: { ...state.noiseSettings, ...updates }
    })),
    
    updatePaletteSettings: (updates) => set(state => ({
      paletteSettings: { ...state.paletteSettings, ...updates }
    })),
    
    updateArtisticSettings: (updates) => set(state => ({
      artisticSettings: { ...state.artisticSettings, ...updates }
    })),
    
    // UI Actions
    setActivePanel: (panel) => set(state => ({
      ui: { ...state.ui, activePanel: panel }
    })),
    
    togglePanel: (panel) => set(state => ({
      ui: {
        ...state.ui,
        panelStates: {
          ...state.ui.panelStates,
          [panel]: {
            ...state.ui.panelStates[panel],
            collapsed: !state.ui.panelStates[panel].collapsed
          }
        }
      }
    })),
    
    setProcessingStatus: (status) => set(state => ({
      ui: { ...state.ui, processingStatus: status }
    })),
    
    // Processing Actions
    startProcessing: (stage = '') => set({
      processing: { isProcessing: true, progress: 0, stage, error: null }
    }),
    
    updateProgress: (progress, stage = '') => set(state => ({
      processing: { ...state.processing, progress, stage }
    })),
    
    finishProcessing: () => set({
      processing: { isProcessing: false, progress: 100, stage: 'complete', error: null }
    }),
    
    setProcessingError: (error) => set({
      processing: { isProcessing: false, progress: 0, stage: 'error', error }
    }),
    
    // Debug Actions
    addDebugLog: (message, level = 'info') => set(state => ({
      debug: {
        ...state.debug,
        logs: [
          ...state.debug.logs,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message,
            level
          }
        ].slice(-100) // Keep only last 100 logs
      }
    })),
    
    clearDebugLogs: () => set(state => ({
      debug: { ...state.debug, logs: [] }
    })),
    
    updatePerformanceMetrics: (metrics) => set(state => ({
      debug: {
        ...state.debug,
        performanceMetrics: { ...state.debug.performanceMetrics, ...metrics }
      }
    })),
    
    // History Actions
    addToHistory: (image) => set(state => {
      const newHistory = [
        ...state.imageHistory.slice(0, state.currentHistoryIndex + 1),
        image
      ];
      return {
        imageHistory: newHistory.slice(-20), // Keep only last 20 states
        currentHistoryIndex: newHistory.length - 1
      };
    }),
    
    undo: () => set(state => {
      if (state.currentHistoryIndex > 0) {
        const newIndex = state.currentHistoryIndex - 1;
        return {
          currentHistoryIndex: newIndex,
          processedImage: state.imageHistory[newIndex]
        };
      }
      return state;
    }),
    
    redo: () => set(state => {
      if (state.currentHistoryIndex < state.imageHistory.length - 1) {
        const newIndex = state.currentHistoryIndex + 1;
        return {
          currentHistoryIndex: newIndex,
          processedImage: state.imageHistory[newIndex]
        };
      }
      return state;
    }),
    
    // Reset Actions
    resetSettings: () => set(state => ({
      ditheringSettings: {
        algorithm: 'floyd-steinberg',
        strength: 1.0,
        matrix: null,
        orderingMatrix: null,
      },
      posterizationSettings: {
        mode: 'uniform',
        levels: 8,
        variation: 0.2,
        contrast: 1.0,
        brightness: 0,
      },
      noiseSettings: {
        source: 'perlin',
        scale: 0.05,
        intensity: 0.5,
        octaves: 3,
        blackValue: 0,
        whiteValue: 1,
        distortion: 0,
        blendMode: 'multiply',
      },
      artisticSettings: {
        painterlyShadows: false,
        organicEdges: false,
        colorBleed: false,
        textureStrength: 0.3,
      },
    })),
    
    resetAll: () => set({
      originalImage: null,
      processedImage: null,
      noiseImage: null,
      imageHistory: [],
      currentHistoryIndex: -1,
      processing: { isProcessing: false, progress: 0, stage: '', error: null },
    }),
  }))
);

// =========================
// COMPUTED SELECTORS
// =========================

/**
 * Selector for getting all current settings as a single object
 */
export const useAllSettings = () => {
  return useAppStore(state => ({
    dithering: state.ditheringSettings,
    posterization: state.posterizationSettings,
    noise: state.noiseSettings,
    palette: state.paletteSettings,
    artistic: state.artisticSettings,
  }));
};

/**
 * Selector for UI state
 */
export const useUIState = () => {
  return useAppStore(state => state.ui);
};

/**
 * Selector for processing state
 */
export const useProcessingState = () => {
  return useAppStore(state => state.processing);
};

/**
 * Selector for debug state
 */
export const useDebugState = () => {
  return useAppStore(state => state.debug);
};

/**
 * Selector for checking if undo/redo is available
 */
export const useHistoryState = () => {
  return useAppStore(state => ({
    canUndo: state.currentHistoryIndex > 0,
    canRedo: state.currentHistoryIndex < state.imageHistory.length - 1,
    historyLength: state.imageHistory.length,
    currentIndex: state.currentHistoryIndex,
  }));
};