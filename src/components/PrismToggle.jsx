import React from 'react';
import './PrismToggle.css';

const PrismToggle = ({ isPrismEnabled, onToggle, isLoading }) => {
  return (
    <div className="prism-toggle-container">
      <button
        onClick={onToggle}
        className={`prism-toggle ${isPrismEnabled ? 'enabled' : 'disabled'}`}
        disabled={isLoading}
        title={isPrismEnabled ? 'Prismatic Intelligence' : 'Flat Chat'}
      >
        <div className="prism-icon">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Prism shape */}
    <path
      d="M12 2L4 9V15L12 22L20 15V9L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Internal facets */}
    <path
      d="M12 2L12 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 9L12 15L20 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
  </svg>
</div>
        <span className="prism-label">
          {isPrismEnabled ? 'ON' : 'OFF'}
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
