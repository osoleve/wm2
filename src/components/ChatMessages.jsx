import React, { useRef, useEffect } from 'react';
import Message from './Message';
import { useChat } from '../hooks/useChat';

import './ChatMessages.css';

const ChatMessages = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

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
          <h3>
            The <span className="highlight2">limits</span> of your <span className="highlight">language</span>
            <br />are 
            the <span className="highlight2">limits</span> of your <span className="highlight">world</span>
          </h3>
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
