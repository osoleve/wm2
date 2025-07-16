// src/components/ConversationTreeBrowser.jsx
import React, { useState, useEffect } from 'react';
import './ConversationTreeBrowser.css';

const ConversationTreeBrowser = ({ 
  isOpen, 
  onClose, 
  onLoadTree, 
  getAllTrees, 
  searchTrees,
  currentTreeId,
  onExportTree,
  onImportTree,
  onDeleteTree
}) => {
  const [trees, setTrees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedTreeId, setSelectedTreeId] = useState(currentTreeId);

  useEffect(() => {
    if (isOpen) {
      loadTrees();
    }
  }, [isOpen]);

  const loadTrees = () => {
    const allTrees = getAllTrees();
    setTrees(allTrees.sort((a, b) => 
      new Date(b.lastModified) - new Date(a.lastModified)
    ));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchTrees(query);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

  const handleLoadTree = (treeId) => {
    onLoadTree(treeId);
    onClose();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportTree(file);
      loadTrees();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tree-browser-overlay" onClick={onClose}>
      <div className="tree-browser" onClick={e => e.stopPropagation()}>
        <div className="tree-browser-header">
          <h2>Conversation Trees</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="tree-browser-toolbar">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="tree-search-input"
          />
          
          <div className="tree-actions">
            <label className="import-button">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              📥 Import
            </label>
            
            <button 
              className="export-button"
              onClick={() => onExportTree()}
              disabled={!currentTreeId}
            >
              📤 Export Current
            </button>
          </div>
        </div>

        <div className="tree-browser-content">
          {searchResults ? (
            <div className="search-results">
              <h3>Search Results</h3>
              {searchResults.length === 0 ? (
                <p className="no-results">No matching conversations found</p>
              ) : (
                searchResults.map(result => (
                  <div key={result.treeId} className="search-result">
                    <div className="result-header">
                      <h4>{result.title}</h4>
                      <button 
                        className="load-button"
                        onClick={() => handleLoadTree(result.treeId)}
                      >
                        Load
                      </button>
                    </div>
                    <div className="result-matches">
                      {result.matches.slice(0, 3).map((match, idx) => (
                        <div key={idx} className="match-preview">
                          <span className="match-role">{match.role}:</span>
                          <span className="match-content">
                            {match.content.substring(0, 100)}...
                          </span>
                        </div>
                      ))}
                      {result.matches.length > 3 && (
                        <div className="more-matches">
                          +{result.matches.length - 3} more matches
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="tree-list">
              {trees.length === 0 ? (
                <div className="empty-state">
                  <p>No conversation trees found</p>
                </div>
              ) : (
                trees.map(tree => (
                  <div 
                    key={tree.id} 
                    className={`tree-item ${tree.id === currentTreeId ? 'current' : ''}`}
                    onClick={() => setSelectedTreeId(tree.id)}
                  >
                    <div className="tree-header">
                      <h3>{tree.title}</h3>
                      <span className="tree-date">{formatDate(tree.lastModified)}</span>
                    </div>
                    
                    {tree.stats && (
                      <div className="tree-stats">
                        <span className="stat">
                          💬 {tree.stats.totalMessages} messages
                        </span>
                        <span className="stat">
                          🌿 {tree.stats.branches} branches
                        </span>
                        <span className="stat">
                          📊 Depth: {tree.stats.maxDepth}
                        </span>
                        {tree.stats.prismMessages > 0 && (
                          <span className="stat prism">
                            💎 {tree.stats.prismMessages} prism
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="tree-actions">
                      <button 
                        className="action-button load"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadTree(tree.id);
                        }}
                      >
                        Load
                      </button>
                      <button 
                        className="action-button export"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportTree(tree.id);
                        }}
                      >
                        Export
                      </button>
                      {tree.id !== currentTreeId && (
                        <button 
                          className="action-button delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this conversation tree?')) {
                              onDeleteTree(tree.id);
                              loadTrees();
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationTreeBrowser;