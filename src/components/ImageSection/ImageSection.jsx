import React from 'react';
import { useAppStore } from '@stores/appStore';
import ImagePreview from '@components/ImagePreview/ImagePreview';
import './ImageSection.css';

/**
 * Image Section Component
 * Displays original, noise, and processed images in a grid layout
 */
const ImageSection = () => {
  const { 
    originalImage, 
    processedImage, 
    noiseImage,
    addDebugLog 
  } = useAppStore();

  const handleImageClick = (type, event, transform) => {
    addDebugLog(`${type} image clicked - zoom: ${transform.zoom}x`, 'debug');
  };

  const handleImageLoad = (type, event) => {
    const img = event.target;
    addDebugLog(`${type} image loaded: ${img.naturalWidth}×${img.naturalHeight}`, 'info');
  };

  return (
    <section className="image-section">
      <div className="images-container">
        {/* Original Image */}
        <ImagePreview
          image={originalImage}
          title="Original Image"
          onImageClick={(e, transform) => handleImageClick('Original', e, transform)}
          onImageLoad={(e) => handleImageLoad('Original', e)}
          showZoomControls={true}
          showInfoPanel={true}
        />

        {/* Noise Visualization */}
        <ImagePreview
          image={noiseImage}
          title="Noise Influence"
          onImageClick={(e, transform) => handleImageClick('Noise', e, transform)}
          onImageLoad={(e) => handleImageLoad('Noise', e)}
          showZoomControls={true}
          showInfoPanel={true}
        />

        {/* Processed Result */}
        <ImagePreview
          image={processedImage}
          title="Final Result"
          onImageClick={(e, transform) => handleImageClick('Result', e, transform)}
          onImageLoad={(e) => handleImageLoad('Result', e)}
          showZoomControls={true}
          showInfoPanel={true}
        />
      </div>

      {/* Processing Status */}
      <div className="processing-status">
        {!originalImage && (
          <div className="status-message info">
            <span className="status-icon">📁</span>
            Upload an image to get started with dithering
          </div>
        )}
        
        {originalImage && !processedImage && (
          <div className="status-message">
            <span className="status-icon">⚙️</span>
            Adjust settings and process your image
          </div>
        )}
        
        {processedImage && (
          <div className="status-message success">
            <span className="status-icon">✅</span>
            Processing complete! You can download the result or continue editing
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageSection;