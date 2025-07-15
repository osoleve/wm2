import React, { useState } from 'react';
import './PrismToggle.css';

const PrismToggle = ({ isPrismEnabled, onToggle, isLoading }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggle = () => {
    onToggle();
    setHasInteracted(true);
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    if (!hasInteracted) {
      setShowTooltip(true);
    }
  };

  return (
    <div className="prism-toggle-container">
      <div 
        className="prism-toggle-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={handleToggle}
          className={`prism-toggle-button ${isPrismEnabled ? 'enabled' : 'disabled'}`}
          disabled={isLoading}
        >
          <div className="toggle-track">
            <div className="toggle-labels">
              <span className="label-off">Single</span>
              <span className="label-on">Prism</span>
            </div>
            <div className="toggle-thumb">
              {isPrismEnabled ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 9V15L12 22L20 15V9L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2L12 22M4 9L12 15L20 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              )}
            </div>
          </div>
        </button>
        
        {showTooltip && (
          <div className="prism-tooltip">
            <div className="tooltip-arrow"></div>
            Prism mode analyzes your question through multiple theoretical perspectives for deeper insights
          </div>
        )}
      </div>
      
      <div className="prism-status">
        {isPrismEnabled ? (
          <>
            <span className="status-text">Multi-perspective analysis</span>
            {isLoading && (
              <div className="prism-loading">
                <div className="loading-bar"></div>
              </div>
            )}
          </>
        ) : (
          <span className="status-text">Standard chat mode</span>
        )}
      </div>
    </div>
  );
};

export default PrismToggle;
