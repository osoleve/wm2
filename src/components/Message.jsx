import React, { useState } from 'react';
import './Message.css';

const Message = ({ message, isUser, onRegenerate }) => {
  const [activePerspective, setActivePerspective] = useState('synthesis');
  
  const isPrismMessage = message.isPrism && message.perspectives;

  const getDisplayContent = () => {
    if (!isPrismMessage) {
      return message.content;
    }

    if (activePerspective === 'synthesis') {
      return message.synthesis || message.content;
    }

    const perspective = message.perspectives.find(p => p.perspective === activePerspective);
    return perspective ? perspective.content : message.content;
  };

  const getDisplayTitle = () => {
    if (!isPrismMessage) {
      return isUser ? 'User' : 'AI';
    }

    if (activePerspective === 'synthesis') {
      return 'AI Synthesis';
    }

    return activePerspective;
  };

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-ai'} ${isPrismMessage ? 'message-prism' : ''}`}>
      <div className="message-content">
        {isPrismMessage && (
          <div className="prism-tabs">
            <button 
              className={`prism-tab ${activePerspective === 'synthesis' ? 'active' : ''}`}
              onClick={() => setActivePerspective('synthesis')}
            >
              Synthesis ({message.perspectives.length})
            </button>
            {message.perspectives.map((perspective, index) => (
              <button 
                key={index}
                className={`prism-tab ${activePerspective === perspective.perspective ? 'active' : ''}`}
                onClick={() => setActivePerspective(perspective.perspective)}
                title={perspective.perspective}
                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                {perspective.perspective}
              </button>
            ))}
          </div>
        )}
        <div className="message-text">
          {getDisplayContent()}
        </div>
        {!isUser && (
          <div className="message-actions">
            <button onClick={onRegenerate} className="regenerate-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
