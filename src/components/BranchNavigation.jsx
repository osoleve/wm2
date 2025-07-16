import React, { useState } from 'react';
import styles from './BranchNavigation.module.css';

export const BranchNavigation = ({ branchInfo, onNavigate, currentMessageId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (index) => {
    const targetMessageId = branchInfo.siblings[index];
    onNavigate(targetMessageId);
    setIsOpen(false);
  };

  if (!branchInfo.hasBranches) return null;

  return (
    <div className={styles.branchNavigation}>
      <button 
        className={styles.branchButton}
        onClick={() => setIsOpen(!isOpen)}
        title={`Branch ${branchInfo.currentBranchIndex + 1} of ${branchInfo.branchCount}`}
      >
        {branchInfo.currentBranchIndex + 1}/{branchInfo.branchCount}
      </button>
      
      {isOpen && (
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
