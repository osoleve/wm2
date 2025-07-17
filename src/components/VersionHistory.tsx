import React, { useState } from 'react';
import styles from './VersionHistory.module.css';

interface MessageVersion {
  id: string;
  content: string;
  timestamp: number;
  isCurrent?: boolean;
}

interface VersionHistoryProps {
  messageId: string;
  versions: MessageVersion[];
  onSwitchToVersion: (messageId: string, versionId: string) => void;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  messageId, 
  versions, 
  onSwitchToVersion, 
  onClose 
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const handleSwitchToVersion = (versionId: string): void => {
    const version = versions.find(v => v.id === versionId);
    if (versionId && version && !version.isCurrent) {
      onSwitchToVersion(messageId, versionId);
    }
    onClose();
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getVersionPreview = (content: string): string => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Message Versions</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.versionList}>
          {versions.map((version, index) => (
            <div 
              key={version.id} 
              className={`${styles.versionItem} ${version.isCurrent ? styles.current : ''}`}
              onClick={() => setSelectedVersion(version.id)}
            >
              <div className={styles.versionHeader}>
                <div className={styles.versionInfo}>
                  <span className={styles.versionNumber}>Version {versions.length - index}</span>
                  <span className={styles.timestamp}>{formatTimestamp(version.timestamp)}</span>
                  {version.isCurrent && <span className={styles.currentLabel}>Current</span>}
                </div>
                {!version.isCurrent && (
                  <button 
                    className={styles.restoreButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwitchToVersion(version.id);
                    }}
                  >
                    Restore
                  </button>
                )}
              </div>
              
              <div className={styles.versionContent}>
                {selectedVersion === version.id ? (
                  <div className={styles.fullContent}>
                    {version.content}
                  </div>
                ) : (
                  <div className={styles.preview}>
                    {getVersionPreview(version.content)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};