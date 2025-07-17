import React, { useState } from 'react';
import styles from './BranchNavigation.module.css';

interface BranchInfo {
  hasBranches: boolean;
  branchCount?: number;
  currentBranchIndex?: number;
  siblings?: string[];
  isSiblingBranch?: boolean;
}

interface BranchNavigationProps {
  branchInfo: BranchInfo;
  onNavigate: (messageId: string) => void;
  currentMessageId: string;
}

export const BranchNavigation: React.FC<BranchNavigationProps> = ({ 
  branchInfo, 
  onNavigate, 
  currentMessageId 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleNavigate = (index: number): void => {
    if (branchInfo.siblings && branchInfo.siblings[index]) {
      const targetMessageId = branchInfo.siblings[index];
      onNavigate(targetMessageId);
      setIsOpen(false);
    }
  };

  if (!branchInfo.hasBranches) return null;

  return (
    <div className={styles.branchNavigation}>
      <button 
        className={styles.branchButton}
        onClick={() => setIsOpen(!isOpen)}
        title={`Branch ${(branchInfo.currentBranchIndex || 0) + 1} of ${branchInfo.branchCount || 0}`}
      >
        {(branchInfo.currentBranchIndex || 0) + 1}/{branchInfo.branchCount || 0}
      </button>
      
      {isOpen && branchInfo.siblings && (
        <div className={styles.branchMenu}>
          {branchInfo.siblings.map((siblingId, index) => (
            <button
              key={siblingId}
              className={`${styles.branchOption} ${siblingId === currentMessageId ? styles.active : ''}`}
              onClick={() => handleNavigate(index)}
            >
              Branch {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};