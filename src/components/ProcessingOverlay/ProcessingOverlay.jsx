import React, { useEffect, useState } from 'react';
import { useAppStore, useProcessingState } from '@stores/appStore';
import './ProcessingOverlay.css';

/**
 * Processing Overlay Component
 * Shows processing status, progress, and allows cancellation
 * 
 * Features:
 * - Animated progress bar
 * - Stage-specific messages
 * - Cancel processing functionality
 * - Error display
 * - Performance timing
 */
const ProcessingOverlay = () => {
  const { setProcessingError, finishProcessing, addDebugLog } = useAppStore();
  const processing = useProcessingState();
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track processing start time
  useEffect(() => {
    if (processing.isProcessing && !startTime) {
      setStartTime(Date.now());
      setElapsedTime(0);
    } else if (!processing.isProcessing) {
      setStartTime(null);
      setElapsedTime(0);
    }
  }, [processing.isProcessing, startTime]);

  // Update elapsed time
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel processing?')) {
      setProcessingError('Processing cancelled by user');
      addDebugLog('Processing cancelled by user', 'warn');
    }
  };

  const handleRetry = () => {
    finishProcessing();
    addDebugLog('Processing error cleared, ready to retry', 'info');
  };

  const formatTime = (ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStageMessage = (stage) => {
    const stageMessages = {
      'loading': 'Loading image data...',
      'preprocessing': 'Preprocessing image...',
      'noise-generation': 'Generating noise map...',
      'posterization': 'Applying posterization...',
      'dithering': 'Applying dithering algorithm...',
      'color-mapping': 'Mapping to color palette...',
      'postprocessing': 'Final processing...',
      'complete': 'Processing complete!',
      'error': 'An error occurred during processing'
    };
    
    return stageMessages[stage] || stage || 'Processing...';
  };

  const getProgressColor = () => {
    if (processing.error) return 'var(--status-error)';
    if (processing.progress === 100) return 'var(--status-success)';
    return 'var(--accent-cyan)';
  };

  // Don't render if not processing and no error
  if (!processing.isProcessing && !processing.error) {
    return null;
  }

  return (
    <div className="processing-overlay">
      <div className="processing-modal">
        {/* Header */}
        <div className="processing-header">
          <div className="processing-icon">
            {processing.error ? '❌' : processing.progress === 100 ? '✅' : '⚙️'}
          </div>
          <h3 className="processing-title">
            {processing.error ? 'Processing Error' : 
             processing.progress === 100 ? 'Processing Complete' : 
             'Processing Image'}
          </h3>
        </div>

        {/* Content */}
        <div className="processing-content">
          {processing.error ? (
            // Error State
            <div className="error-content">
              <p className="error-message">{processing.error}</p>
              <div className="error-actions">
                <button className="btn btn-primary" onClick={handleRetry}>
                  Try Again
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Processing State
            <div className="progress-content">
              {/* Stage Information */}
              <div className="stage-info">
                <p className="stage-message">{getStageMessage(processing.stage)}</p>
                {startTime && (
                  <p className="elapsed-time">
                    Elapsed: {formatTime(elapsedTime)}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${processing.progress}%`,
                      backgroundColor: getProgressColor()
                    }}
                  >
                    <div className="progress-shine"></div>
                  </div>
                </div>
                <div className="progress-text">
                  {Math.round(processing.progress)}%
                </div>
              </div>

              {/* Processing Details */}
              <div className="processing-details">
                <div className="detail-item">
                  <span className="detail-label">Stage:</span>
                  <span className="detail-value">{processing.stage || 'Initializing'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Progress:</span>
                  <span className="detail-value">{processing.progress.toFixed(1)}%</span>
                </div>
              </div>

              {/* Cancel Button */}
              {processing.isProcessing && processing.progress < 100 && (
                <button 
                  className="btn btn-danger cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel Processing
                </button>
              )}

              {/* Complete Actions */}
              {processing.progress === 100 && !processing.isProcessing && (
                <div className="complete-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={finishProcessing}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;