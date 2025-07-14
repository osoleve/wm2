import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import PrismToggle from './PrismToggle';
import LoggingDashboard from './LoggingDashboard';
import chatService from '../services/chatService';
import './Chat.css';

const Chat = () => {
  const { messages, isLoading, error, sendMessage, clearChat, isPrismEnabled, togglePrism } = useChat();
  // Default chat model is Haiku
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku');
  // Default prism backend model is Llama 3.3 70B Instruct
  const [selectedPrismModel, setSelectedPrismModel] = useState('meta-llama/llama-3.3-70b-instruct');
  const [isLoggingDashboardOpen, setIsLoggingDashboardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await chatService.getAvailableModels();
        const popularModels = availableModels.filter(model => {
          return true; // Include all models for now
        }).map(model => ({
          id: model.id,
          name: model.name || model.id.split('/').pop(),
          context_length: model.context_length
        }));

        const sortedModels = popularModels.sort((a, b) => {
          const getCategory = (id) => {
            const lower = id.toLowerCase();
            if (lower.includes('free')) return 0;
            return 999;
          };
          
          const catA = getCategory(a.id);
          const catB = getCategory(b.id);
          
          if (catA !== catB) return catA - catB;
          return a.name.localeCompare(b.name);
        });

        setModels(sortedModels);
      } catch (error) {
        console.error('Error fetching models:', error);
        const fallbackModels = [
          { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
          { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
          { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
          { id: 'openai/gpt-4', name: 'GPT-4' },
          { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
          { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
          { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
        ];
        setModels(fallbackModels);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Close mobile menu when pressing Escape and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  console.log('Chat render - isLoggingDashboardOpen:', isLoggingDashboardOpen);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1 className={isPrismEnabled ? 'prism-enabled' : ''}>{isPrismEnabled ? '( ͡°( ͡° ͜ʖ( ͡° ͜ʖ ͡°)ʖ ͡°) ͡°)' : '👁️'}</h1>
        </div>
        <div className="header-controls">
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle model selection menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          
          {/* {isPrismEnabled && (
            <div className="prism-status-badge">
              <div className="prism-icon-small">∆y</div>
              {/* <span>Prism Active</span> */}
            {/* </div> */}
          
          {/* <button 
            onClick={() => {
              console.log('History button clicked');
              setIsLoggingDashboardOpen(true);
            }} 
            className="history-button"
            title="View Session History"
          >
            📊 History
          </button> */}
          <button 
            onClick={clearChat} 
            className="clear-button"
            disabled={messages.length === 0}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Model Selection</h3>
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="mobile-menu-body">
              <div className="mobile-model-selection">
                <label className="mobile-model-label">
                  {isPrismEnabled ? 'Primary Model:' : 'Chat Model:'}
                </label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setIsMobileMenuOpen(false); // Close menu after selection
                  }}
                  className="mobile-model-select"
                  disabled={modelsLoading}
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
                <div className="mobile-model-selection">
                  <label className="mobile-model-label">
                    Prism Backend Model:
                  </label>
                  <select 
                    value={selectedPrismModel} 
                    onChange={(e) => {
                      setSelectedPrismModel(e.target.value);
                      setIsMobileMenuOpen(false); // Close menu after selection
                    }}
                    className="mobile-model-select"
                    disabled={modelsLoading}
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
              
              <div className="mobile-prism-toggle">
                <PrismToggle 
                  isPrismEnabled={isPrismEnabled}
                  onToggle={togglePrism}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      <ChatMessages messages={messages} isLoading={isLoading} />
      
      <ChatInput 
        onSendMessage={(msg) => sendMessage(msg, selectedModel, selectedPrismModel)}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedPrismModel={selectedPrismModel}
        onPrismModelChange={setSelectedPrismModel}
        isPrismEnabled={isPrismEnabled}
        togglePrism={togglePrism}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <LoggingDashboard 
        isOpen={isLoggingDashboardOpen}
        onClose={() => setIsLoggingDashboardOpen(false)}
      />
    </div>
  );
};

export default Chat;
