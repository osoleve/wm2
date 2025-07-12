import React from 'react';
import './Message.css';

const Message = ({ message, isUser }) => {
  return (
    <div className={`message ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="message-content">
        <div className="message-text">
          {message.content}
        </div>
        <div className="message-role">
          {isUser ? 'You' : 'AI'}
        </div>
      </div>
    </div>
  );
};

export default Message;
