import React, { useRef, useEffect } from 'react';
import Message from './Message';
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
            The limits of your <span className="highlight">language</span>
            <br />
            are the limits of your <span className="highlight">world</span>
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
          <div className="typing-text">AI is typing...</div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
