// src/components/Message.jsx - Update the message display logic
import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('synthesis');
  
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
      setShowControls(false);
    }
  };

  const handleShowVersions = () => {
    setShowVersionHistory(true);
  };

  // Get the content to display based on active tab
  const getDisplayContent = () => {
    if (!isPrismMessage) {
      return message.content;
    }

    if (activeTab === 'synthesis') {
      return message.synthesis || message.content;
    }

    const perspective = message.perspectives.find(p => p.perspective === activeTab);
    return perspective?.content || message.content;
  };

  return (
    <div 
      className={`message ${isUser ? 'message-user' : 'message-ai'} ${isPrismMessage ? 'message-prism' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="message-content">
        {message.isEdited && <span className="edited-label">(edited)</span>}
        
        {/* Prism tabs at the top of the message */}
        {isPrismMessage && (
          <div className="prism-tabs">
            <button
              className={`prism-tab ${activeTab === 'synthesis' ? 'active' : ''}`}
              onClick={() => setActiveTab('synthesis')}
            >
              Synthesis
            </button>
            
            {message.perspectives.map((perspective, index) => (
              <button
                key={index}
                className={`prism-tab ${activeTab === perspective.perspective ? 'active' : ''}`}
                onClick={() => setActiveTab(perspective.perspective)}
              >
                {perspective.perspective}
              </button>
            ))}
          </div>
        )}
        
        <div className="message-text">
          {getDisplayContent()}
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