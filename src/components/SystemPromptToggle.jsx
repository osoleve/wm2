import React from 'react';
import './SystemPromptToggle.css';

const SystemPromptToggle = ({ isEnabled, onToggle }) => {
  return (
    <div className="system-prompt-toggle">
      <label htmlFor="system-prompt-toggle-switch">
        <span>System Prompt</span>
      </label>
      <button
        id="system-prompt-toggle-switch"
        className={`switch ${isEnabled ? 'on' : 'off'}`}
        onClick={onToggle}
        aria-pressed={isEnabled}
      >
        <span className="slider"></span>
      </button>
    </div>
  );
};

export default SystemPromptToggle;
