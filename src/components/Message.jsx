import React, { useState } from 'react';
import './Message.css';

const Message = ({ message, isUser }) => {
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
      return isUser ? 'You' : 'AI';
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
        {/* <div className="message-role">
          {getDisplayTitle()}
        </div> */}
      </div>
    </div>
  );
};

export default Message;
