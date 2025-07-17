import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import PrismToggle from './PrismToggle';
import SystemPromptToggle from './SystemPromptToggle';
import LoggingDashboard from './LoggingDashboard';
import ConversationBrowser from './ConversationBrowser';
import ExportButton from './ExportButton';
import chatService from '../services/chatService';
import { Model, Provider, BranchInfo } from '../types';
import './Chat.css';

const Chat: React.FC = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    newChat, 
    isPrismEnabled, 
    togglePrism,
    editMessage,
    regenerateMessage,
    navigateToBranch,
    getBranchInfo,
    copyMessage,
    getMessageVersions,
    switchToVersion,
    loadTree,
    currentTreeId
  } = useChat();
  
  // Default chat model is Haiku
  const [provider, setProvider] = useState<Provider>('groq'); // Start with GROQ as default
  const [selectedModel, setSelectedModel] = useState<string>('moonshotai/kimi-k2-instruct');
  // Default prism backend model is Kimi K2
  const [selectedPrismModel, setSelectedPrismModel] = useState<string>('moonshotai/kimi-k2-instruct');
  const [isSystemPromptEnabled, setIsSystemPromptEnabled] = useState<boolean>(true);
  
  // Update selectedModel when switching providers
  useEffect(() => {
    if (provider === 'groq') {
      setSelectedModel('moonshotai/kimi-k2-instruct'); // Default to Kimi K2 for GROQ
    } else {
      setSelectedModel('moonshotai/kimi-k2'); // Default to Kimi K2 for OpenRouter
    }
  }, [provider]);
  
  const [isLoggingDashboardOpen, setIsLoggingDashboardOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isConversationBrowserOpen, setIsConversationBrowserOpen] = useState<boolean>(false);
  const [models, setModels] = useState<Model[]>([]);
  const [_modelsLoading, setModelsLoading] = useState<boolean>(true); // used in fetchModels useEffect

  // Fetch available models
  useEffect(() => {
    chatService.setProvider(provider);
    const fetchModels = async (): Promise<void> => {
      try {
        const availableModels = await chatService.getAvailableModels();
        const popularModels = availableModels.filter(() => {
          return true; // Include all models for now
        }).map((model: any): Model => ({
          id: model.id,
          name: model.name || model.id.split('/').pop(),
          context_length: model.context_length
        }));

        const sortedModels = popularModels.sort((a: Model, b: Model) => {
          const getCategory = (id: string): number => {
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
        
        // Set default model based on provider when switching
        if (provider === 'groq' && sortedModels.length > 0) {
          // Set Kimi K2 as default for GROQ
          const kimiModel = sortedModels.find((m: Model) => m.id === 'moonshotai/kimi-k2-instruct');
          if (kimiModel) {
            setSelectedModel('moonshotai/kimi-k2-instruct');
            setSelectedPrismModel('moonshotai/kimi-k2-instruct');
          } else {
            // Fallback to first model if Kimi K2 not available
            setSelectedModel(sortedModels[0].id);
            setSelectedPrismModel(sortedModels[0].id);
          }
        } else if (provider === 'openrouter' && sortedModels.length > 0) {
          // Set Kimi K2 as default for OpenRouter
          const kimiModel = sortedModels.find((m: Model) => m.id === 'moonshotai/kimi-k2');
          if (kimiModel) {
            setSelectedModel('moonshotai/kimi-k2');
          } else {
            // Fallback to Claude Haiku if Kimi K2 not available
            const claudeModel = sortedModels.find((m: Model) => m.id === 'anthropic/claude-3-5-haiku');
            if (claudeModel) {
              setSelectedModel('anthropic/claude-3-5-haiku');
            } else {
              setSelectedModel(sortedModels[0].id);
            }
          }
          
          // Set Llama 3.3 70B as default prism model for OpenRouter
          const llamaModel = sortedModels.find((m: Model) => m.id === 'meta-llama/llama-3.3-70b-instruct');
          if (llamaModel) {
            setSelectedPrismModel('meta-llama/llama-3.3-70b-instruct');
          } else {
            setSelectedPrismModel(sortedModels[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        const fallbackModels: Model[] = [
          { id: 'anthropic/claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
          { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
          { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B' },
        ];
        setModels(fallbackModels);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, [provider]);

  // Close mobile menu when pressing Escape and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
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
          <h1 className={isPrismEnabled ? 'prism-enabled' : ''}>{isPrismEnabled ? 'Prism' : 'Iris'}</h1>
        </div>
        <div className="header-controls">
          <div className="provider-toggle">
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Provider:</span>
            <button
              onClick={() => setProvider('openrouter')}
              style={{ 
                fontWeight: provider === 'openrouter' ? 'bold' : 'normal',
                background: provider === 'openrouter' ? '#007acc' : 'transparent',
                color: provider === 'openrouter' ? 'white' : '#666',
                border: '1px solid #ddd',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >OpenRouter</button>
            <button
              onClick={() => setProvider('groq')}
              style={{ 
                fontWeight: provider === 'groq' ? 'bold' : 'normal',
                background: provider === 'groq' ? '#007acc' : 'transparent',
                color: provider === 'groq' ? 'white' : '#666',
                border: '1px solid #ddd',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >GROQ</button>
          </div>
          <div className="desktop-system-prompt-toggle">
            <SystemPromptToggle
              isEnabled={isSystemPromptEnabled}
              onToggle={() => setIsSystemPromptEnabled(prev => !prev)}
            />
          </div>
          <button 
            className="mobile-model-indicator"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="model-name">
              {models.find((m: Model) => m.id === selectedModel)?.name.split(' ')[0] || 'Model'}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle model selection menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          
          <button 
            onClick={() => setIsConversationBrowserOpen(true)}
            className="conversation-browser-button"
            title="Browse conversations"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Browse
          </button>
          
          <ExportButton treeId={currentTreeId} />
          
          <button 
            onClick={newChat} 
            className="new-chat-button"
            title="Start a new conversation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
            New Chat
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Model Settings</h3>
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-content">
              <div className="model-section">
                <label className="model-label">
                  Provider
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={() => {
                      setProvider('openrouter');
                      if (window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                      }
                    }}
                    style={{ 
                      flex: 1,
                      fontWeight: provider === 'openrouter' ? 'bold' : 'normal',
                      background: provider === 'openrouter' ? '#007acc' : 'transparent',
                      color: provider === 'openrouter' ? 'white' : '#666',
                      border: '1px solid #ddd',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >OpenRouter</button>
                  <button
                    onClick={() => {
                      setProvider('groq');
                      if (window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                      }
                    }}
                    style={{ 
                      flex: 1,
                      fontWeight: provider === 'groq' ? 'bold' : 'normal',
                      background: provider === 'groq' ? '#007acc' : 'transparent',
                      color: provider === 'groq' ? 'white' : '#666',
                      border: '1px solid #ddd',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >GROQ</button>
                </div>
              </div>
              
              <div className="model-section">
                <label className="model-label">
                  Chat Model
                </label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    // Add haptic feedback if available
                    if (window.navigator.vibrate) {
                      window.navigator.vibrate(10);
                    }
                  }}
                  className="model-select-mobile"
                >
                  {models.map((model: Model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {isPrismEnabled && (
                <div className="model-section">
                  <label className="model-label">
                    Prism Analysis Model
                  </label>
                  <select 
                    value={selectedPrismModel} 
                    onChange={(e) => {
                      setSelectedPrismModel(e.target.value);
                      if (window.navigator.vibrate) {
                        window.navigator.vibrate(10);
                      }
                    }}
                    className="model-select-mobile"
                  >
                    {models.map((model: Model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mobile-prism-section">
                <PrismToggle 
                  isPrismEnabled={isPrismEnabled}
                  onToggle={togglePrism}
                  isLoading={isLoading}
                />
              </div>
              <div className="mobile-prism-section">
                <SystemPromptToggle
                  isEnabled={isSystemPromptEnabled}
                  onToggle={() => setIsSystemPromptEnabled(prev => !prev)}
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

      <ChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={(msg: string) => sendMessage(msg, selectedModel, selectedPrismModel, isSystemPromptEnabled)}
        selectedModel={selectedModel}
        isPrismMode={isPrismEnabled}
        onEditMessage={editMessage}
        onRegenerateMessage={regenerateMessage}
        onCopyMessage={copyMessage}
        onNavigateBranch={navigateToBranch}
        getBranchInfo={getBranchInfo as (messageId: string) => BranchInfo | null}
        getMessageVersions={getMessageVersions}
        onSwitchToVersion={switchToVersion}
      />
      
      <ChatInput 
        onSendMessage={(msg: string) => sendMessage(msg, selectedModel, selectedPrismModel, isSystemPromptEnabled)}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedPrismModel={selectedPrismModel}
        onPrismModelChange={setSelectedPrismModel}
        isPrismEnabled={isPrismEnabled}
        togglePrism={togglePrism}
        isMobileMenuOpen={isMobileMenuOpen}
        provider={provider}
        setProvider={setProvider}
      />

      <LoggingDashboard 
        isOpen={isLoggingDashboardOpen}
        onClose={() => setIsLoggingDashboardOpen(false)}
      />
      
      <ConversationBrowser
        isOpen={isConversationBrowserOpen}
        onClose={() => setIsConversationBrowserOpen(false)}
        onLoadConversation={(treeId) => {
          loadTree(treeId);
          setIsConversationBrowserOpen(false);
        }}
        currentTreeId={currentTreeId}
      />
    </div>
  );
};

export default Chat;