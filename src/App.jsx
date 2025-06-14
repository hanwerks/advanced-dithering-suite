import React, { useEffect } from 'react';
import { useAppStore } from '@stores/appStore';
import Header from '@components/Header/Header';
import ImageSection from '@components/ImageSection/ImageSection';
import ControlsPanel from '@components/ControlsPanel/ControlsPanel';
import DebugConsole from '@components/DebugConsole/DebugConsole';
import ProcessingOverlay from '@components/ProcessingOverlay/ProcessingOverlay';
import './App.css';

/**
 * Main Application Component
 * Orchestrates the entire Advanced Dithering Suite interface
 */
function App() {
  const { 
    ui,
    processing,
    addDebugLog,
    setProcessingStatus 
  } = useAppStore();

  // Initialize application
  useEffect(() => {
    addDebugLog('Advanced Dithering Suite initialized', 'info');
    setProcessingStatus('idle');
  }, [addDebugLog, setProcessingStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const { undo } = useAppStore.getState();
        undo();
        addDebugLog('Undo triggered via keyboard', 'debug');
      }
      
      // Ctrl/Cmd + Shift + Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        const { redo } = useAppStore.getState();
        redo();
        addDebugLog('Redo triggered via keyboard', 'debug');
      }
      
      // F12 for debug console toggle
      if (e.key === 'F12') {
        e.preventDefault();
        const currentState = useAppStore.getState();
        currentState.ui.showDebugConsole = !currentState.ui.showDebugConsole;
        addDebugLog('Debug console toggled via F12', 'debug');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addDebugLog]);

  return (
    <div className="app">
      <Header />
      
      <main className="app-main">
        <div className="app-layout">
          <ControlsPanel />
          <ImageSection />
        </div>
      </main>

      {/* Conditional overlays and modals */}
      {processing.isProcessing && <ProcessingOverlay />}
      {ui.showDebugConsole && <DebugConsole />}
    </div>
  );
}

export default App;