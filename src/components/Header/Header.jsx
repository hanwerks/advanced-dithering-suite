import React from 'react';
import { useAppStore, useHistoryState } from '@stores/appStore';
import './Header.css';

/**
 * Application Header Component
 * Contains title, actions, and global controls
 */
const Header = () => {
  const { 
    resetAll, 
    undo, 
    redo,
    ui,
    addDebugLog 
  } = useAppStore();
  
  const historyState = useHistoryState();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset everything? This will clear all images and settings.')) {
      resetAll();
      addDebugLog('Application reset', 'info');
    }
  };

  const toggleDebugConsole = () => {
    const currentState = useAppStore.getState();
    const newState = !currentState.ui.showDebugConsole;
    useAppStore.setState(state => ({
      ui: { ...state.ui, showDebugConsole: newState }
    }));
    addDebugLog(`Debug console ${newState ? 'opened' : 'closed'}`, 'debug');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-main">Advanced Dithering Suite</span>
            <span className="title-subtitle">Professional Image Processing Tool</span>
          </h1>
        </div>

        <div className="header-actions">
          {/* History Controls */}
          <div className="button-group">
            <button
              className="btn btn-small"
              onClick={undo}
              disabled={!historyState.canUndo}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              className="btn btn-small"
              onClick={redo}
              disabled={!historyState.canRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              ↷ Redo
            </button>
          </div>

          {/* Debug Toggle */}
          <button
            className={`btn btn-small ${ui.showDebugConsole ? 'active' : ''}`}
            onClick={toggleDebugConsole}
            title="Toggle Debug Console (F12)"
          >
            🐛 Debug
          </button>

          {/* Reset Button */}
          <button
            className="btn btn-small btn-danger"
            onClick={handleReset}
            title="Reset Everything"
          >
            🔄 Reset All
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;