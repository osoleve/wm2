import React, { useState } from 'react';
import './BranchIndicator.css';

interface Branch {
  id: string;
  preview: string;
  descendantCount: number;
}

interface BranchPointInfo {
  nodeId: string;
  branches: Branch[];
  hasBranches: boolean;
  depth: number;
}

interface ConversationTreeService {
  getBranches: (nodeId: string) => Branch[];
}

interface BranchIndicatorProps {
  currentPath: string[];
  branchPoints?: any; // Not used in component
  onNavigateToBranch: (branchId: string) => void;
  conversationTreeService: ConversationTreeService;
}

const BranchIndicator: React.FC<BranchIndicatorProps> = ({ 
  currentPath, 
  onNavigateToBranch,
  conversationTreeService 
}) => {
  const [showBranchMenu, setShowBranchMenu] = useState<boolean>(false);
  
  if (!currentPath || currentPath.length === 0) return null;

  // Get branch information for current path
  const pathBranches: BranchPointInfo[] = currentPath.map((nodeId, index) => {
    const branches = conversationTreeService.getBranches(nodeId);
    return {
      nodeId,
      branches,
      hasBranches: branches.length > 0,
      depth: index
    };
  }).filter(item => item.hasBranches);

  if (pathBranches.length === 0) return null;

  return (
    <div className="branch-indicator">
      <button 
        className="branch-indicator-button"
        onClick={() => setShowBranchMenu(!showBranchMenu)}
        title="View conversation branches"
      >
        <span className="branch-icon">🌿</span>
        <span className="branch-count">{pathBranches.length} branch{pathBranches.length > 1 ? 'es' : ''}</span>
      </button>

      {showBranchMenu && (
        <div className="branch-menu">
          <div className="branch-menu-header">
            <h4>Conversation Branches</h4>
            <button 
              className="close-button"
              onClick={() => setShowBranchMenu(false)}
            >
              ×
            </button>
          </div>
          
          <div className="branch-list">
            {pathBranches.map(({ nodeId, branches, depth }) => (
              <div key={nodeId} className="branch-point">
                <div className="branch-point-header">
                  <span className="depth-indicator" style={{ width: `${depth * 20}px` }} />
                  <span className="branch-label">Branch Point (Depth {depth})</span>
                </div>
                
                <div className="branch-options">
                  {branches.map((branch, idx) => (
                    <button
                      key={branch.id}
                      className="branch-option"
                      onClick={() => {
                        onNavigateToBranch(branch.id);
                        setShowBranchMenu(false);
                      }}
                    >
                      <span className="branch-number">Branch {idx + 1}</span>
                      <span className="branch-preview">{branch.preview}</span>
                      <span className="branch-info">
                        {branch.descendantCount} messages
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchIndicator;