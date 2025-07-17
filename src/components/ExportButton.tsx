import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import exportService from '../services/exportService';
import './ExportButton.css';

interface ExportButtonProps {
  treeId?: string | null;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ treeId, className = '' }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'text'>('markdown');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includePrismData: true,
    includeTimestamps: false
  });

  const handleExport = () => {
    exportService.exportConversation({
      format: exportFormat,
      treeId: treeId || undefined,
      ...exportOptions
    });
    setShowExportModal(false);
  };

  return (
    <>
      <button 
        className={`export-button ${className}`}
        onClick={() => setShowExportModal(true)}
        title="Export current conversation"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        Export
      </button>

      {showExportModal && createPortal(
        <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>Export Conversation</h3>
              <button 
                className="close-button"
                onClick={() => setShowExportModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="export-modal-content">
              <div className="export-format-selection">
                <label className="export-label">Export Format:</label>
                <div className="format-options">
                  {exportService.getAvailableFormats().map((format) => (
                    <label key={format.id} className="format-option">
                      <input
                        type="radio"
                        name="format"
                        value={format.id}
                        checked={exportFormat === format.id}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                      />
                      <div className="format-details">
                        <span className="format-name">{format.name}</span>
                        <span className="format-description">{format.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="export-options">
                <label className="export-label">Options:</label>
                <div className="option-checkboxes">
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeMetadata: e.target.checked
                      }))}
                    />
                    Include metadata
                  </label>
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includePrismData}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includePrismData: e.target.checked
                      }))}
                    />
                    Include Prism perspectives
                  </label>
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTimestamps}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        includeTimestamps: e.target.checked
                      }))}
                    />
                    Include timestamps
                  </label>
                </div>
              </div>

            </div>
            
            <div className="export-modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="export-confirm-button"
                onClick={handleExport}
              >
                Export
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ExportButton;