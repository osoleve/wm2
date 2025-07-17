import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import exportService from '../services/exportService';
import conversationTreeService from '../services/conversationTreeService';
import './ConversationBrowser.css';

interface ConversationInfo {
  id: string;
  title: string;
  created: string;
  lastModified: string;
  stats: {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    prismMessages: number;
    branches: number;
  };
}

interface ConversationBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadConversation: (treeId: string) => void;
  currentTreeId: string | null;
}

const ConversationBrowser: React.FC<ConversationBrowserProps> = ({
  isOpen,
  onClose,
  onLoadConversation,
  currentTreeId
}) => {
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'text'>('markdown');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includePrismData: true,
    includeTimestamps: false
  });

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Refresh conversations when current tree changes
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [currentTreeId, isOpen]);

  const loadConversations = () => {
    setIsLoading(true);
    try {
      const allTrees = conversationTreeService.getAllTrees();
      
      const conversationList = Object.values(allTrees).map(tree => {
        const stats = conversationTreeService.getTreeStats(tree.id);
        
        return {
          id: tree.id,
          title: tree.title,
          created: tree.created,
          lastModified: tree.lastModified,
          stats: stats || {
            totalMessages: 0,
            userMessages: 0,
            aiMessages: 0,
            prismMessages: 0,
            branches: 0
          }
        };
      }).filter(conversation => {
        // Only show conversations that have messages or are the current conversation
        return conversation.stats.totalMessages > 0 || conversation.id === currentTreeId;
      }).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      setConversations(conversationList);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = conversationTreeService.searchTrees(query.trim());
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleDeleteConversation = (treeId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      conversationTreeService.deleteTree(treeId);
      loadConversations();
      
      // If we deleted the current conversation, the tree service will handle switching
      if (treeId === currentTreeId) {
        const newCurrentTree = conversationTreeService.getCurrentTree();
        if (newCurrentTree) {
          onLoadConversation(newCurrentTree.id);
        }
      }
    }
  };

  const handleDeleteAllConversations = () => {
    if (window.confirm('Are you sure you want to delete ALL conversations? This action cannot be undone and will permanently remove all your conversation history.')) {
      const allTrees = conversationTreeService.getAllTrees();
      const confirmText = `This will delete ${Object.keys(allTrees).length} conversations. Type "DELETE ALL" to confirm:`;
      
      const userInput = window.prompt(confirmText);
      if (userInput === 'DELETE ALL') {
        // Delete all trees
        Object.keys(allTrees).forEach(treeId => {
          conversationTreeService.deleteTree(treeId);
        });
        
        // Create a new empty conversation
        const newTreeId = conversationTreeService.createNewTree('New Conversation');
        onLoadConversation(newTreeId);
        loadConversations();
      }
    }
  };

  const handleExportConversation = (treeId: string) => {
    setSelectedConversation(treeId);
    setShowExportModal(true);
  };

  const executeExport = () => {
    if (!selectedConversation) return;

    exportService.exportConversation({
      format: exportFormat,
      treeId: selectedConversation,
      ...exportOptions
    });

    setShowExportModal(false);
    setSelectedConversation(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  if (!isOpen) return null;

  return (
    <div className="conversation-browser-overlay" onClick={onClose}>
      <div className="conversation-browser-panel" onClick={(e) => e.stopPropagation()}>
        <div className="conversation-browser-header">
          <h2>Conversation Browser</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="conversation-browser-search">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="conversation-browser-content">
          {searchQuery && searchResults.length > 0 ? (
            <div className="search-results">
              <h3>Search Results</h3>
              {searchResults.map((result) => (
                <div key={result.treeId} className="search-result">
                  <div className="search-result-header">
                    <span className="search-result-title">{result.title}</span>
                    <span className="search-result-date">{formatDate(result.lastModified)}</span>
                  </div>
                  <div className="search-result-matches">
                    {result.matches.slice(0, 3).map((match: any, index: number) => (
                      <div key={index} className="search-match">
                        <span className="match-role">{match.role}:</span>
                        <span className="match-content">{match.content.substring(0, 100)}...</span>
                      </div>
                    ))}
                  </div>
                  <div className="search-result-actions">
                    <button 
                      onClick={() => {
                        try {
                          onLoadConversation(result.treeId);
                        } catch (error) {
                          console.error('Error loading conversation:', error);
                          alert('Failed to load conversation. Please try again.');
                        }
                      }}
                      className="load-button"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="conversation-list">
              <div className="conversation-list-header">
                <h3>All Conversations ({conversations.length})</h3>
                {conversations.length > 0 && (
                  <button
                    onClick={handleDeleteAllConversations}
                    className="delete-all-button"
                    title="Delete all conversations"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                    Delete All
                  </button>
                )}
              </div>
              
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="empty-state">
                  <p>No conversations found.</p>
                </div>
              ) : (
                <div className="conversation-items">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className={`conversation-item ${conversation.id === currentTreeId ? 'current' : ''}`}
                    >
                      <div className="conversation-item-header">
                        <div className="conversation-item-title">
                          {truncateTitle(conversation.title)}
                          {conversation.id === currentTreeId && (
                            <span className="current-badge">Current</span>
                          )}
                        </div>
                        <div className="conversation-item-actions">
                          <button
                            onClick={() => handleExportConversation(conversation.id)}
                            className="export-button"
                            title="Export conversation"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              try {
                                onLoadConversation(conversation.id);
                              } catch (error) {
                                console.error('Error loading conversation:', error);
                                alert('Failed to load conversation. Please try again.');
                              }
                            }}
                            className="load-button"
                            disabled={conversation.id === currentTreeId}
                          >
                            {conversation.id === currentTreeId ? 'Current' : 'Load'}
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conversation.id)}
                            className="delete-button"
                            title="Delete conversation"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="conversation-item-metadata">
                        <div className="conversation-item-stats">
                          <span>{conversation.stats.totalMessages} messages</span>
                          {conversation.stats.prismMessages > 0 && (
                            <span className="prism-badge">{conversation.stats.prismMessages} prism</span>
                          )}
                          {conversation.stats.branches > 0 && (
                            <span className="branches-badge">{conversation.stats.branches} branches</span>
                          )}
                        </div>
                        <div className="conversation-item-dates">
                          <span className="date-label">Modified:</span>
                          <span className="date-value">{formatDate(conversation.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Export Modal */}
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
                  className="export-button"
                  onClick={executeExport}
                >
                  Export
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default ConversationBrowser;