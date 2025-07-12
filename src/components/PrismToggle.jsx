import React from 'react';
import './PrismToggle.css';

const PrismToggle = ({ isPrismEnabled, onToggle, isLoading }) => {
  return (
    <div className="prism-toggle-container">
      <button
        onClick={onToggle}
        className={`prism-toggle ${isPrismEnabled ? 'enabled' : 'disabled'}`}
        disabled={isLoading}
        title={isPrismEnabled ? 'Prism Mode: ON - AI will analyze from multiple theoretical perspectives' : 'Prism Mode: OFF - Standard AI response'}
      >
        <div className="prism-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 3L3 7L12 11L21 7L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 7L12 11L21 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="prism-label">
          Prism {isPrismEnabled ? 'ON' : 'OFF'}
        </span>
        {isLoading && isPrismEnabled && (
          <div className="prism-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </button>
      {isPrismEnabled && (
        <div className="prism-description">
          Multi-perspective analysis enabled
        </div>
      )}
    </div>
  );
};

export default PrismToggle;
