import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@stores/appStore';
import { processDithering } from '@algorithms';
import './ImagePreview.css';

/**
 * Advanced Image Preview Component with Zoom & Pan
 * Extracted and adapted from the original HTML artifact
 * 
 * Features:
 * - Click to toggle zoom (1x / 2x)
 * - Drag to pan when zoomed
 * - Zoom controls overlay
 * - Transform state preservation
 * - Touch support for mobile
 * - Customizable appearance
 */
const ImagePreview = ({
  image = null,
  title = "Image Preview",
  className = "",
  showZoomControls = true,
  showInfoPanel = true,
  onImageClick = null,
  onImageLoad = null,
  preserveTransforms = true,
  maxZoom = 3.0,
  minZoom = 1.0,
  zoomStep = 0.5,
  // Live processing props
  isProcessingView = false,
  processingSettings = null,
  originalImageData = null,
  onProcessingComplete = null,
  ...props
}) => {
  // Refs
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  // const processingCanvasRef = useRef(null);
  
  // Local state for transform management
  const [transform, setTransform] = useState({
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    hasDragged: false,
    dragStart: { x: 0, y: 0 }
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCanvas, setProcessedCanvas] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  // Store access for debug logging and processing status
  const { addDebugLog, setProcessingStatus } = useAppStore();

  // Reset transform when image changes (unless preserveTransforms is true)
  useEffect(() => {
    if (!preserveTransforms && image) {
      handleReset();
    }
  }, [image, preserveTransforms]);

  // Live processing effect
  useEffect(() => {
    if (isProcessingView && originalImageData && processingSettings) {
      performLiveProcessing();
    }
  }, [isProcessingView, originalImageData, processingSettings]);

  // Update canvas when processedCanvas changes
  useEffect(() => {
    if (processedCanvas && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(processedCanvas, 0, 0);
    }
  }, [processedCanvas]);

  // Live processing function
  const performLiveProcessing = useCallback(async () => {
    if (!originalImageData || !processingSettings || isProcessing) return;

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingStatus('processing');
    
    try {
      addDebugLog(`Live processing: ${processingSettings.algorithm} (${processingSettings.category})`, 'info');
      
      const processedImageData = await processDithering(
        originalImageData,
        processingSettings.category,
        processingSettings.algorithm,
        processingSettings.strength,
        processingSettings.parameters,
        processingSettings.palette,
        processingSettings.customPalettes
      );

      // Create canvas with processed result
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = processedImageData.width;
      canvas.height = processedImageData.height;
      ctx.putImageData(processedImageData, 0, 0);
      
      setProcessedCanvas(canvas);
      setProcessingStatus('idle');
      
      if (onProcessingComplete) {
        onProcessingComplete(canvas, processedImageData);
      }
      
      addDebugLog('Live processing completed successfully', 'info');
    } catch (error) {
      setProcessingError(error.message);
      setProcessingStatus('error');
      addDebugLog(`Processing error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [originalImageData, processingSettings, isProcessing, onProcessingComplete, addDebugLog, setProcessingStatus]);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    setTransform(prev => {
      const newZoom = Math.min(prev.zoom + zoomStep, maxZoom);
      addDebugLog(`Zoom in: ${newZoom.toFixed(1)}x`, 'debug');
      return { ...prev, zoom: newZoom };
    });
  }, [zoomStep, maxZoom, addDebugLog]);

  const handleZoomOut = useCallback(() => {
    setTransform(prev => {
      const newZoom = Math.max(prev.zoom - zoomStep, minZoom);
      if (newZoom <= minZoom) {
        addDebugLog(`Zoom out: Reset to ${minZoom}x`, 'debug');
        return { ...prev, zoom: minZoom, panX: 0, panY: 0 };
      }
      addDebugLog(`Zoom out: ${newZoom.toFixed(1)}x`, 'debug');
      return { ...prev, zoom: newZoom };
    });
  }, [zoomStep, minZoom, addDebugLog]);

  const handleReset = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      isDragging: false,
      hasDragged: false
    }));
    addDebugLog('Image view reset', 'debug');
  }, [addDebugLog]);

  // Mouse event handlers for panning
  const handleMouseDown = useCallback((e) => {
    if (transform.zoom > 1.0 && (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS')) {
      setTransform(prev => ({
        ...prev,
        isDragging: true,
        hasDragged: false,
        dragStart: {
          x: e.clientX - prev.panX,
          y: e.clientY - prev.panY
        }
      }));
      e.preventDefault();
    }
  }, [transform.zoom]);

  const handleMouseMove = useCallback((e) => {
    if (transform.isDragging && transform.zoom > 1.0) {
      const newPanX = e.clientX - transform.dragStart.x;
      const newPanY = e.clientY - transform.dragStart.y;
      
      // Check for actual drag movement
      const dragDistance = Math.sqrt(
        Math.pow(newPanX - transform.panX, 2) + Math.pow(newPanY - transform.panY, 2)
      );
      
      if (dragDistance > 3) {
        setTransform(prev => ({ ...prev, hasDragged: true }));
      }
      
      // Constrain panning
      const maxPan = 200 * transform.zoom;
      const constrainedPanX = Math.max(-maxPan, Math.min(maxPan, newPanX));
      const constrainedPanY = Math.max(-maxPan, Math.min(maxPan, newPanY));
      
      setTransform(prev => ({
        ...prev,
        panX: constrainedPanX,
        panY: constrainedPanY
      }));
    }
  }, [transform.isDragging, transform.zoom, transform.dragStart, transform.panX, transform.panY]);

  const handleMouseUp = useCallback(() => {
    if (transform.isDragging) {
      setTransform(prev => ({
        ...prev,
        isDragging: false
      }));
      
      // Reset drag flag after a delay to allow normal clicks
      if (transform.hasDragged) {
        setTimeout(() => {
          setTransform(prev => ({ ...prev, hasDragged: false }));
        }, 100);
      }
    }
  }, [transform.isDragging, transform.hasDragged]);

  // Click handler for zoom toggle
  const handleImageClick = useCallback((e) => {
    // Don't toggle zoom if we just finished dragging or clicking controls
    if (transform.hasDragged || transform.isDragging || 
        e.target.closest('.zoom-controls') || 
        e.target.classList.contains('zoom-btn')) {
      return;
    }
    
    // Only toggle zoom if clicking on image
    if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
      if (transform.zoom > 1.0) {
        handleReset();
      } else {
        handleZoomIn();
      }
      
      // Call custom click handler if provided
      if (onImageClick) {
        onImageClick(e, { zoom: transform.zoom, panX: transform.panX, panY: transform.panY });
      }
    }
  }, [transform, handleReset, handleZoomIn, onImageClick]);

  // Event listeners setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1 && transform.zoom > 1.0) {
      const touch = e.touches[0];
      setTransform(prev => ({
        ...prev,
        isDragging: true,
        hasDragged: false,
        dragStart: {
          x: touch.clientX - prev.panX,
          y: touch.clientY - prev.panY
        }
      }));
      e.preventDefault();
    }
  }, [transform.zoom]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && transform.isDragging && transform.zoom > 1.0) {
      const touch = e.touches[0];
      const newPanX = touch.clientX - transform.dragStart.x;
      const newPanY = touch.clientY - transform.dragStart.y;
      
      const maxPan = 200 * transform.zoom;
      const constrainedPanX = Math.max(-maxPan, Math.min(maxPan, newPanX));
      const constrainedPanY = Math.max(-maxPan, Math.min(maxPan, newPanY));
      
      setTransform(prev => ({
        ...prev,
        panX: constrainedPanX,
        panY: constrainedPanY,
        hasDragged: true
      }));
      e.preventDefault();
    }
  }, [transform.isDragging, transform.zoom, transform.dragStart]);

  const handleTouchEnd = useCallback(() => {
    setTransform(prev => ({ ...prev, isDragging: false }));
  }, []);

  // Image load handler
  const handleImageLoad = useCallback((e) => {
    addDebugLog(`Image loaded: ${e.target.naturalWidth}×${e.target.naturalHeight}`, 'info');
    if (onImageLoad) {
      onImageLoad(e);
    }
  }, [addDebugLog, onImageLoad]);

  // Calculate transform string
  const getTransformStyle = () => {
    if (transform.zoom === 1.0) {
      return 'scale(1)';
    }
    return `scale(${transform.zoom}) translate(${transform.panX / transform.zoom}px, ${transform.panY / transform.zoom}px)`;
  };

  // Determine container classes
  const containerClasses = [
    'image-preview',
    className,
    transform.zoom > 1.0 ? 'zoomed' : '',
    transform.isDragging ? 'dragging' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="image-preview-box">
      <h3 className="image-preview-title">{title}</h3>
      
      <div 
        ref={containerRef}
        className={containerClasses}
        onMouseDown={handleMouseDown}
        onClick={handleImageClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
        {...props}
      >
        {(image || processedCanvas) ? (
          <>
            {/* Render either processed canvas or original image */}
            {isProcessingView && processedCanvas ? (
              <canvas
                ref={canvasRef}
                className="preview-canvas"
                style={{
                  transform: getTransformStyle(),
                  transformOrigin: 'center center',
                  transition: transform.isDragging ? 'none' : 'transform 0.3s ease',
                  maxWidth: '100%',
                  maxHeight: '500px',
                  cursor: transform.zoom > 1.0 ? (transform.isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                }}
                width={processedCanvas.width}
                height={processedCanvas.height}
                onClick={handleImageClick}
                draggable={false}
              />
            ) : image ? (
              <img
                ref={imageRef}
                src={image}
                alt={title}
                className="preview-image"
                style={{
                  transform: getTransformStyle(),
                  transformOrigin: 'center center',
                  transition: transform.isDragging ? 'none' : 'transform 0.3s ease'
                }}
                onLoad={handleImageLoad}
                draggable={false}
              />
            ) : null}

            {/* Zoom Controls Overlay */}
            {showZoomControls && (
              <div className="zoom-controls">
                <button
                  className="zoom-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  disabled={transform.zoom >= maxZoom}
                  title="Zoom In"
                >
                  🔍+
                </button>
                <button
                  className="zoom-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  disabled={transform.zoom <= minZoom}
                  title="Zoom Out"
                >
                  🔍-
                </button>
                <button
                  className="zoom-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  title="Reset View"
                >
                  ⌂
                </button>
              </div>
            )}

            {/* Processing Status */}
            {isProcessingView && (
              <div className="processing-status">
                {isProcessing && (
                  <div className="processing-indicator">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </div>
                )}
                {processingError && (
                  <div className="processing-error">
                    <span>❌ {processingError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Info Panel */}
            {showInfoPanel && (
              <div className="info-panel">
                <div>Zoom: <span className="zoom-level">{transform.zoom.toFixed(1)}x</span></div>
                <div>Pan: <span className="pan-position">{Math.round(transform.panX)}, {Math.round(transform.panY)}</span></div>
                {isProcessingView && processedCanvas && (
                  <div>Size: <span className="canvas-size">{processedCanvas.width}×{processedCanvas.height}</span></div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="placeholder">
            {isProcessingView ? (
              originalImageData ? "Adjusting settings will update the preview" : "Load an image to see processed results"
            ) : (
              title === "Original" ? "Upload an image to get started" : "Image will appear here"
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;