import React, { useRef, useEffect } from 'react';
import Message from './Message';
import { useChat } from '../hooks/useChat';

import './ChatMessages.css';

const ChatMessages = ({ messages, isLoading, onSendMessage, selectedModel }) => {
  const messagesEndRef = useRef(null);

  const examplePrompts = [
    "How do we deal with food stamp fraud without harming the vulnerable?",
    "ELI5 'Data structures as algorithms'",
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
            <h3>
              The <span className="highlight2">limits</span> of your <span className="highlight">language</span>
              <br />are 
              the <span className="highlight2">limits</span> of your <span className="highlight">world</span>
            </h3>
            
            <p className="tagline">
              Enable Prism mode to explore questions through multiple theoretical lenses
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
            key={index}
            message={message}
            isUser={message.role === 'user'}
          />
        ))
      )}
      
      {isLoading && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
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
