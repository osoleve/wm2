import React from 'react';
import './SessionSummary.css';

const SessionSummary = ({ session, onSelect, onDelete, onExport, isSelected }) => {
  // Add null/undefined checks
  if (!session) {
    console.warn('SessionSummary: session prop is null or undefined');
    return null;
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} min ago`;
      } else if (diffHours < 24) {
        return `${Math.floor(diffHours)} hours ago`;
      } else if (diffDays < 7) {
        return `${Math.floor(diffDays)} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const getSessionTitle = () => {
    const totalMessages = session.totalMessages || 0;
    const prismInteractions = session.prismInteractions || 0;
    
    if (totalMessages === 0) {
      return 'Empty Session';
    }
    
    const prismRatio = totalMessages > 0 ? 
      (prismInteractions / totalMessages * 100).toFixed(0) : 0;
    
    if (prismInteractions > 0) {
      return `Mixed Session (${prismRatio}% Prism)`;
    } else {
      return 'Standard Chat Session';
    }
  };

  return (
    <div className={`session-summary-card ${isSelected ? 'selected' : ''}`}>
      <div className="session-header">
        <div className="session-title">
          <h4>{getSessionTitle()}</h4>
          <span className="session-time">{formatDate(session.startTime)}</span>
        </div>
        <div className="session-actions">
          <button 
            className="action-button view"
            onClick={() => onSelect(session.id)}
            title="View Details"
          >
            👁️
          </button>
          <button 
            className="action-button export"
            onClick={() => onExport(session.id)}
            title="Export Session"
          >
            📤
          </button>
          <button 
            className="action-button delete"
            onClick={() => onDelete(session.id)}
            title="Delete Session"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="session-stats">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Messages:</span>
            <span className="stat-value">{session.totalMessages || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Duration:</span>
            <span className="stat-value">{session.duration || 'Unknown'}</span>
          </div>
        </div>

        <div className="interaction-breakdown">
          {(session.prismInteractions || 0) > 0 && (
            <div className="interaction-stat prism">
              <span className="prism-icon">◊</span>
              <span>{session.prismInteractions} Prism</span>
            </div>
          )}
          {(session.regularInteractions || 0) > 0 && (
            <div className="interaction-stat regular">
              <span className="regular-icon">💬</span>
              <span>{session.regularInteractions} Standard</span>
            </div>
          )}
        </div>
      </div>

      {(session.modelsUsed && session.modelsUsed.length > 0) && (
        <div className="models-used">
          <span className="models-label">Models:</span>
          <div className="models-list">
            {session.modelsUsed.map(model => (
              <span key={model} className="model-tag">
                {model.split('/').pop()}
              </span>
            ))}
          </div>
        </div>
      )}

      {(session.perspectivesUsed && session.perspectivesUsed.length > 0) && (
        <div className="perspectives-used">
          <span className="perspectives-label">
            Perspectives ({session.perspectivesUsed.length}):
          </span>
          <div className="perspectives-preview">
            {session.perspectivesUsed.slice(0, 3).map(perspective => (
              <span key={perspective} className="perspective-tag-small">
                {perspective}
              </span>
            ))}
            {session.perspectivesUsed.length > 3 && (
              <span className="more-indicator">
                +{session.perspectivesUsed.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSummary;