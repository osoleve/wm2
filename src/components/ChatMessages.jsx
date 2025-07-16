import React, { useRef, useEffect } from 'react';
import Message from './Message';
import './ChatMessages.css';

const ChatMessages = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  selectedModel,
  isPrismMode, 
  prismResponses,
  onEditMessage,
  onRegenerateMessage,
  onCopyMessage,
  onNavigateBranch,
  getBranchInfo,
  getMessageVersions,
  onSwitchToVersion
}) => {
  const messagesEndRef = useRef(null);

  const examplePrompts = [
    "How do we deal with food stamp fraud without harming the vulnerable?",
    "What are the implications of LLMs on entrenched interests in the US?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-background">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
          </div>
          
          <div className="empty-state-content">
            <h2>
              The <span className="highlight2">limits</span> of your <span className="highlight">language</span>
              <br />are 
              the <span className="highlight2">limits</span> of your <span className="highlight">world</span>
            </h2>
            
            <p className="tagline">
              Enable Prism mode to gain new perspectives
            </p>
            
            <div className="example-prompts">
              <p className="prompts-label">Try asking:</p>
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="example-prompt"
                  onClick={() => onSendMessage && onSendMessage(prompt, selectedModel)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <Message
            key={message.id || index}
            message={message}
            isUser={message.role === 'user'}
            isLast={index === messages.length - 1}
            onEdit={onEditMessage}
            onRegenerate={onRegenerateMessage}
            onCopy={onCopyMessage}
            onNavigateBranch={onNavigateBranch}
            getBranchInfo={getBranchInfo}
            getMessageVersions={getMessageVersions}
            onSwitchToVersion={onSwitchToVersion}
            isPrismMode={isPrismMode}
            prismResponses={isPrismMode && message.role === 'assistant' 
              ? prismResponses?.[message.id] 
              : null}
          />
        ))
      )}
      
      {isLoading && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
          </div>
          <div className="typing-text"></div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
