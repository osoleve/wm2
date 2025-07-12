import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import PrismToggle from './PrismToggle';
import './Chat.css';

const Chat = () => {
  const { messages, isLoading, error, sendMessage, clearChat, isPrismEnabled, togglePrism } = useChat();
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1>AI Chat Assistant</h1>
          <p>Powered by OpenRouter</p>
        </div>
        <div className="header-controls">
          <PrismToggle 
            isPrismEnabled={isPrismEnabled}
            onToggle={togglePrism}
            isLoading={isLoading}
          />
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
        onSendMessage={sendMessage}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        isPrismEnabled={isPrismEnabled}
      />
    </div>
  );
};

export default Chat;
