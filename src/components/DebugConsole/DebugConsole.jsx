import React, { useEffect, useRef } from 'react';
import { useAppStore, useDebugState } from '@stores/appStore';
import './DebugConsole.css';

/**
 * Debug Console Component
 * Extracted and enhanced from the original HTML artifact
 * 
 * Features:
 * - Real-time log display with color coding
 * - Auto-scroll to latest entries
 * - Performance metrics display
 * - Export logs functionality
 * - Collapsible interface
 */
const DebugConsole = () => {
  const consoleRef = useRef(null);
  const { clearDebugLogs, addDebugLog } = useAppStore();
  const debugState = useDebugState();

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [debugState.logs]);

  const handleClose = () => {
    useAppStore.setState(state => ({
      ui: { ...state.ui, showDebugConsole: false }
    }));
    addDebugLog('Debug console closed', 'debug');
  };

  const handleClear = () => {
    clearDebugLogs();
  };

  const handleExportLogs = () => {
    const logText = debugState.logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dithering-suite-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    addDebugLog('Logs exported successfully', 'info');
  };

  const addTestLogs = () => {
    addDebugLog('Test info message', 'info');
    addDebugLog('Test warning message', 'warn');
    addDebugLog('Test error message', 'error');
    addDebugLog('Test success message', 'success');
    addDebugLog('Test debug message', 'debug');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'debug': return '🐛';
      default: return '📝';
    }
  };

  return (
    <div className="debug-console-overlay">
      <div className="debug-console-modal">
        <div className="debug-console-header">
          <h3>🐛 Debug Console</h3>
          <div className="debug-console-controls">
            <button 
              className="debug-btn debug-btn-small"
              onClick={addTestLogs}
              title="Add test log entries"
            >
              Test
            </button>
            <button 
              className="debug-btn debug-btn-small"
              onClick={handleExportLogs}
              title="Export logs to file"
            >
              Export
            </button>
            <button 
              className="debug-btn debug-btn-small"
              onClick={handleClear}
              title="Clear all logs"
            >
              Clear
            </button>
            <button 
              className="debug-btn debug-btn-small debug-btn-close"
              onClick={handleClose}
              title="Close debug console"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        {Object.keys(debugState.performanceMetrics).length > 0 && (
          <div className="debug-metrics">
            <h4>Performance Metrics</h4>
            <div className="metrics-grid">
              {Object.entries(debugState.performanceMetrics).map(([key, value]) => (
                <div key={key} className="metric-item">
                  <span className="metric-label">{key}:</span>
                  <span className="metric-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log Entries */}
        <div className="debug-console-content" ref={consoleRef}>
          {debugState.logs.length === 0 ? (
            <div className="debug-entry info">
              <span className="debug-timestamp">{formatTimestamp(new Date().toISOString())}</span>
              <span className="debug-level">INFO</span>
              <span className="debug-message">Debug console ready - no logs yet</span>
            </div>
          ) : (
            debugState.logs.map((log) => (
              <div key={log.id} className={`debug-entry ${log.level}`}>
                <span className="debug-icon">{getLogIcon(log.level)}</span>
                <span className="debug-timestamp">{formatTimestamp(log.timestamp)}</span>
                <span className="debug-level">{log.level.toUpperCase()}</span>
                <span className="debug-message">{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Console Stats */}
        <div className="debug-console-footer">
          <div className="debug-stats">
            <span>Total Logs: {debugState.logs.length}</span>
            {debugState.logs.length > 0 && (
              <>
                <span>•</span>
                <span>Latest: {formatTimestamp(debugState.logs[debugState.logs.length - 1]?.timestamp)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;