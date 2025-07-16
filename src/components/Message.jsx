import React, { useState } from 'react';
import { PrismTabs } from './PrismTabs';
import { EditModal } from './EditModal';
import { BranchNavigation } from './BranchNavigation';
import { VersionHistory } from './VersionHistory';
import './Message.css';

const Message = ({ 
  message, 
  isUser,
  isLast, 
  onEdit, 
  onRegenerate, 
  onCopy, 
  onNavigateBranch,
  getBranchInfo,
  getMessageVersions,
  onSwitchToVersion,
  isPrismMode,
  prismResponses 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const branchInfo = getBranchInfo?.(message.id);
  const isPrismMessage = message.isPrism && message.perspectives;
  const messageVersions = getMessageVersions?.(message.id) || [];
  const hasVersions = messageVersions.length > 1;

  const handleEdit = (newContent) => {
    onEdit(message.id, newContent);
    setShowEditModal(false);
  };

  const handleRegenerate = () => {
    onRegenerate(message.id);
  };

  const handleCopy = async () => {
    const success = await onCopy(message.id);
    if (success) {
      // Show brief success feedback
      setShowControls(false);
    }
  };

  const handleShowVersions = () => {
    setShowVersionHistory(true);
  };

  return (
    <div 
      className={`message ${isUser ? 'message-user' : 'message-ai'} ${isPrismMessage ? 'message-prism' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="message-content">
        {message.isEdited && <span className="edited-label">(edited)</span>}
        <div className="message-text">
          {message.content}
        </div>
        
        {showControls && (
          <div className="message-controls">
            {message.role === 'user' && (
              <button 
                className="control-button"
                onClick={() => setShowEditModal(true)}
                title="Edit message"
              >
                ✏️
              </button>
            )}
            
            {message.role === 'assistant' && (
              <button 
                className="control-button"
                onClick={handleRegenerate}
                title="Regenerate response"
              >
                🔄
              </button>
            )}
            
            {hasVersions && (
              <button 
                className="control-button"
                onClick={handleShowVersions}
                title="View message versions"
              >
                🕐
              </button>
            )}
            
            <button 
              className="control-button"
              onClick={handleCopy}
              title="Copy message"
            >
              📋
            </button>
            
            {branchInfo?.hasBranches && (
              <BranchNavigation
                branchInfo={branchInfo}
                onNavigate={onNavigateBranch}
                currentMessageId={message.id}
              />
            )}
          </div>
        )}
      </div>

      {isPrismMode && message.role === 'assistant' && prismResponses && (
        <PrismTabs responses={prismResponses} />
      )}

      {showEditModal && (
        <EditModal
          originalContent={message.content}
          onSave={handleEdit}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {showVersionHistory && (
        <VersionHistory
          messageId={message.id}
          versions={messageVersions}
          onSwitchToVersion={onSwitchToVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
};

export default Message;
