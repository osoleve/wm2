import React, { useState } from 'react';
import { EditModal } from './EditModal';
import { BranchNavigation } from './BranchNavigation';
import { VersionHistory } from './VersionHistory';
import { MessageWithPrism, Version, BranchInfo, PrismResponse } from '../types';
import './Message.css';

interface MessageProps {
  message: MessageWithPrism;
  isUser: boolean;
  isLast?: boolean; // unused
  onEdit: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
  onCopy: (messageId: string) => Promise<boolean>;
  onNavigateBranch: (messageId: string) => void;
  getBranchInfo?: (messageId: string) => BranchInfo | null;
  getMessageVersions?: (messageId: string) => Version[];
  onSwitchToVersion: (messageId: string, versionId: string) => void;
  isPrismMode?: boolean; // unused
  prismResponses?: PrismResponse[]; // unused
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  isUser,
  isLast: _isLast, // unused
  onEdit, 
  onRegenerate, 
  onCopy, 
  onNavigateBranch,
  getBranchInfo,
  getMessageVersions,
  onSwitchToVersion,
  isPrismMode: _isPrismMode, // unused
  prismResponses: _prismResponses // unused
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  const [_showControls, setShowControls] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('synthesis');
  
  const branchInfo = getBranchInfo?.(message.id);
  const isPrismMessage = message.isPrism && message.perspectives;
  const messageVersions = getMessageVersions?.(message.id) || [];
  
  // Show branch controls only when this message is a sibling branch (alternative response)
  // not when it's a branch point that has children
  const shouldShowBranchControls = branchInfo?.hasBranches && 
    branchInfo?.branchCount > 1 && 
    (branchInfo as any)?.isSiblingBranch === true;

  const handleEdit = (newContent: string): void => {
    onEdit(message.id, newContent);
    setShowEditModal(false);
  };

  const handleRegenerate = (): void => {
    onRegenerate(message.id);
  };

  const handleCopy = async (): Promise<void> => {
    const success = await onCopy(message.id);
    if (success) {
      setShowControls(false);
    }
  };


  // Get the content to display based on active tab
  const getDisplayContent = (): string => {
    if (!isPrismMessage) {
      return message.content;
    }

    if (activeTab === 'synthesis') {
      return message.synthesis || message.content;
    }

    const perspective = message.perspectives?.find(p => p.perspective === activeTab);
    return perspective?.content || message.content;
  };

  return (
    <div className="message-wrapper">
      <div 
        className={`message ${isUser ? 'message-user' : 'message-ai'} ${isPrismMessage ? 'message-prism' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
              
              {message.perspectives?.map((perspective, index) => (
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
          
        </div>
      </div>

      <div 
        className={`message-controls ${isHovered ? 'visible' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
          {message.role === 'user' && (
            <button 
              className="control-button"
              onClick={() => setShowEditModal(true)}
              title="Edit message"
            >
              ✎
            </button>
          )}
          
          {message.role === 'assistant' && (
            <button 
              className="control-button"
              onClick={handleRegenerate}
              title="Regenerate response"
            >
              ↻
            </button>
          )}
          
          <button 
            className="control-button"
            onClick={handleCopy}
            title="Copy message"
          >
            ⧉
          </button>
          
          {shouldShowBranchControls && (
            <BranchNavigation
              branchInfo={branchInfo}
              onNavigate={onNavigateBranch}
              currentMessageId={message.id}
            />
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