import React, { useState } from 'react';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, isLoading, selectedModel, onModelChange, isPrismEnabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message, selectedModel);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const models = [
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'openai/gpt-4', name: 'GPT-4' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
    { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B' },
  ];

  return (
    <div className="chat-input-container">
      <div className="model-selector">
        <select 
          value={selectedModel} 
          onChange={(e) => onModelChange(e.target.value)}
          className="model-select"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-wrapper">
          {isPrismEnabled && (
            <div className="prism-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
              <span>Prism</span>
            </div>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isPrismEnabled ? "Ask a question for multi-perspective analysis..." : "Type your message here..."}
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
