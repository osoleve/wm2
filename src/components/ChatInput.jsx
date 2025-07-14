
import React, { useState, useEffect } from 'react';
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
  isMobileMenuOpen
}) => {
  const [message, setMessage] = useState('');
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await chatService.getAvailableModels();
        
        // Filter and format popular models for better UX
        const popularModels = availableModels.filter(model => {
          const id = model.id.toLowerCase();
          // return (
          //   id.includes('gpt-4') ||
          //   id.includes('gpt-3.5') ||
          //   id.includes('claude-3') ||
          //   id.includes('claude-2') ||
          //   id.includes('llama-3') ||
          //   id.includes('llama-2') ||
          //   id.includes('gemini') ||
          //   id.includes('mixtral') ||
          //   id.includes('qwen') ||
          //   id.includes('deepseek')
          // );
          return true;
        }).map(model => ({
          id: model.id,
          name: model.name || model.id.split('/').pop(),
          context_length: model.context_length
        }));

        // Sort by popularity/preference with better organization
        const sortedModels = popularModels.sort((a, b) => {
          const getCategory = (id) => {
            const lower = id.toLowerCase();
            // if (lower.includes('gpt-4')) return 0;
            // if (lower.includes('claude-3')) return 1;
            // if (lower.includes('gemini')) return 2;
            // if (lower.includes('llama-3')) return 3;
            // if (lower.includes('mixtral')) return 4;
            // if (lower.includes('qwen')) return 5;
            // if (lower.includes('deepseek')) return 6;
            // if (lower.includes('gpt-3.5')) return 7;
            // if (lower.includes('claude-2')) return 8;
            // if (lower.includes('llama-2')) return 9;
            if (lower.includes('free')) return 0;
            return 999;
          };
          
          const catA = getCategory(a.id);
          const catB = getCategory(b.id);
          
          if (catA !== catB) return catA - catB;
          return a.name.localeCompare(b.name);
        });

        setModels(sortedModels);
        
        // Set default model if current selection isn't available
        if (sortedModels.length > 0 && !sortedModels.find(m => m.id === selectedModel)) {
          onModelChange(sortedModels[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch models, using fallback:', error);
        // Fallback models if API fails
        const fallbackModels = [
          { id: 'openai/gpt-4o', name: 'GPT-4o' },
          { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
          { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
          { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
          { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
          { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
          { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B' },
          { id: 'google/gemini-pro', name: 'Gemini Pro' },
        ];
        setModels(fallbackModels);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, [selectedModel, onModelChange]);

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

  return (
    <div className={`chat-input-container ${isPrismEnabled ? 'prism-enabled' : ''}`}>
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
        <div className="desktop-prism-toggle">        <div className="desktop-prism-toggle">
          <PrismToggle 
            isPrismEnabled={isPrismEnabled}
            onToggle={togglePrism}
            isLoading={isLoading}
          />
        </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-wrapper">
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
