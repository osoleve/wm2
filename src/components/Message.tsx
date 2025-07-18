import React, { useState, memo } from 'react';
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
  onEdit, 
  onRegenerate, 
  onCopy, 
  onNavigateBranch,
  getBranchInfo,
  getMessageVersions,
  onSwitchToVersion
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
          
          <div className="message-text">
            {getDisplayContent()}
          </div>
          
        </div>
        
        {/* Vertical Prism tabs on the right side for AI messages */}
        {isPrismMessage && !isUser && (
          <div className="prism-tabs-vertical">
            <button
              className={`prism-tab-vertical ${activeTab === 'synthesis' ? 'active' : ''}`}
              onClick={() => setActiveTab('synthesis')}
            >
              Synthesis
            </button>
            
            {message.perspectives?.map((perspective, index) => (
              <button
                key={index}
                className={`prism-tab-vertical ${activeTab === perspective.perspective ? 'active' : ''}`}
                onClick={() => setActiveTab(perspective.perspective)}
              >
                {perspective.perspective}
              </button>
            ))}
            
            <div className="perspective-count">
              <svg className="perspective-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 9V15L12 22L20 15V9L12 2Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {message.perspectives?.length || 0}
            </div>
          </div>
        )}
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

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: MessageProps, nextProps: MessageProps): boolean => {
  // Check if message content has changed
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (prevProps.message.timestamp !== nextProps.message.timestamp) return false;
  if (prevProps.message.isEdited !== nextProps.message.isEdited) return false;
  
  // Check prism-specific properties
  if (prevProps.message.isPrism !== nextProps.message.isPrism) return false;
  if (prevProps.message.synthesis !== nextProps.message.synthesis) return false;
  
  // Compare perspectives array (shallow comparison for performance)
  const prevPerspectives = prevProps.message.perspectives;
  const nextPerspectives = nextProps.message.perspectives;
  if (prevPerspectives?.length !== nextPerspectives?.length) return false;
  if (prevPerspectives && nextPerspectives) {
    for (let i = 0; i < prevPerspectives.length; i++) {
      if (prevPerspectives[i].perspective !== nextPerspectives[i].perspective) return false;
      if (prevPerspectives[i].content !== nextPerspectives[i].content) return false;
    }
  }
  
  // Check other relevant props
  if (prevProps.isUser !== nextProps.isUser) return false;

  // Also compare branch navigation info to ensure badges update
  const prevBranch = prevProps.getBranchInfo?.(prevProps.message.id);
  const nextBranch = nextProps.getBranchInfo?.(nextProps.message.id);

  const branchChanged = (
    prev: BranchInfo | null | undefined,
    next: BranchInfo | null | undefined
  ): boolean => {
    if (!prev && !next) return false;
    if (!prev || !next) return true;
    if (prev.hasBranches !== next.hasBranches) return true;
    if (!prev.hasBranches && !next.hasBranches) return false;
    if (!prev.hasBranches || !next.hasBranches) return true;
    return (
      prev.branchCount !== next.branchCount ||
      prev.currentBranchIndex !== next.currentBranchIndex
    );
  };

  if (branchChanged(prevBranch, nextBranch)) return false;

  // Functions are assumed to be stable (wrapped in useCallback)
  return true;
};

export default memo(Message, arePropsEqual);