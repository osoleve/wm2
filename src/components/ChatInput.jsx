import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import PrismToggle from './PrismToggle';
import './ChatInput.css';

const ChatInput = ({
  onSendMessage,
  isLoading,
  selectedModel,
  onModelChange,
  selectedPrismModel,
  onPrismModelChange,
  isPrismEnabled,
  togglePrism,
  isMobileMenuOpen,
  provider,
  setProvider
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const textareaRef = useRef(null);
  const maxLength = 16384;
  const longPressTimeoutRef = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Fetch available models on provider change
  useEffect(() => {
    chatService.setProvider(provider);
    const fetchModels = async () => {
      try {
        const availableModels = await chatService.getAvailableModels();
        const popularModels = availableModels.filter(model => true).map(model => ({
          id: model.id,
          name: model.name || model.id.split('/').pop(),
          context_length: model.context_length
        }));
        setModels(popularModels);
        
        // Set default model based on provider when switching
        if (provider === 'groq' && popularModels.length > 0) {
          // Set Kimi K2 as default for GROQ
          const kimiModel = popularModels.find(m => m.id === 'moonshotai/kimi-k2');
          if (kimiModel && !popularModels.find(m => m.id === selectedModel)) {
            onModelChange('moonshotai/kimi-k2');
          } else if (!popularModels.find(m => m.id === selectedModel)) {
            onModelChange(popularModels[0].id);
          }
        } else if (provider === 'openrouter' && popularModels.length > 0) {
          // Set Claude Haiku as default for OpenRouter
          const claudeModel = popularModels.find(m => m.id === 'anthropic/claude-3-5-haiku');
          if (claudeModel && !popularModels.find(m => m.id === selectedModel)) {
            onModelChange('anthropic/claude-3-5-haiku');
          } else if (!popularModels.find(m => m.id === selectedModel)) {
            onModelChange(popularModels[0].id);
          }
        }
      } catch (error) {
        setModels([]);
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message, selectedModel);
      setMessage('');
      // Keep focus on textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setMessage(newValue);
    }
  };

  const handlePressStart = () => {
    setIsLongPressing(false);
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      togglePrism();
      // Haptic feedback for long press
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
  };

  const handlePressEnd = (e) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    if (isLongPressing) {
      e.preventDefault(); // Prevent form submission on long press release
    }
    setIsLongPressing(false);
  };

  return (
    <div className={`chat-input-container ${isPrismEnabled ? 'prism-enabled' : ''} ${isFocused ? 'focused' : ''}`}>
      <div className="input-header">
        <div className="model-selector">
          <label className="model-label">
            <span className="model-label-text">Model:</span>
            <span className="model-label-mobile">{isPrismEnabled ? 'Prism:' : 'Model:'}</span>
          </label>
          <select 
            value={selectedModel} 
            onChange={(e) => onModelChange(e.target.value)}
            className="model-select main-model-select"
            disabled={modelsLoading || isLoading}
          >
            {modelsLoading ? (
              <option>Loading models...</option>
            ) : (
              models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))
            )}
          </select>
        </div>
        {isPrismEnabled && (
          <div className="model-selector prism-model-selector">
            <label className="model-label">
              <span className="model-label-text">Prism Model:</span>
              <span className="model-label-mobile">Prism:</span>
            </label>
            <select
              value={selectedPrismModel}
              onChange={e => onPrismModelChange(e.target.value)}
              className="model-select prism-model-select"
              disabled={modelsLoading || isLoading}
            >
              {modelsLoading ? (
                <option>Loading models...</option>
              ) : (
                models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
        <div className="desktop-prism-toggle">
          <PrismToggle 
            isPrismEnabled={isPrismEnabled}
            onToggle={togglePrism}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isPrismEnabled ? "Ask a question for multi-perspective analysis..." : "Type your message here..."}
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          
          {message.length > 0 && (
            <div className="input-indicators">
              <span className={`char-counter ${message.length > maxLength * 0.9 ? 'warning' : ''}`}>
                {message.length}/{maxLength}
              </span>
            </div>
          )}
          
          <button 
            type="submit" 
            className={`send-button ${message.trim() ? 'ready' : ''} ${isLongPressing ? 'long-pressing' : ''}`}
            disabled={!message.trim() || isLoading}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onClick={(e) => {
              if (isLongPressing) {
                e.preventDefault();
              }
            }}
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
