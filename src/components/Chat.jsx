import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import PrismToggle from './PrismToggle';
import LoggingDashboard from './LoggingDashboard';
import './Chat.css';

const Chat = () => {
  const { messages, isLoading, error, sendMessage, clearChat, isPrismEnabled, togglePrism } = useChat();
  // Default chat model is Haiku
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku');
  // Default prism backend model is Llama 3.3 70B Instruct
  const [selectedPrismModel, setSelectedPrismModel] = useState('meta-llama/llama-3.3-70b-instruct');
  const [isLoggingDashboardOpen, setIsLoggingDashboardOpen] = useState(false);

  console.log('Chat render - isLoggingDashboardOpen:', isLoggingDashboardOpen);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1 className={isPrismEnabled ? 'prism-enabled' : ''}>{isPrismEnabled ? '( ͡°( ͡° ͜ʖ( ͡° ͜ʖ ͡°)ʖ ͡°) ͡°)' : '👁️'}</h1>
        </div>
        <div className="header-controls">
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
      />

      <LoggingDashboard 
        isOpen={isLoggingDashboardOpen}
        onClose={() => setIsLoggingDashboardOpen(false)}
      />
    </div>
  );
};

export default Chat;
