import React, { useState, useEffect } from 'react';
import loggingService from '../services/loggingService';
import SessionSummary from './SessionSummary';
import './LoggingDashboard.css';

interface SessionData {
  id: string;
  startTime: string;
  endTime: string | null;
  messages: Array<{
    id: string;
    timestamp: string;
    userMessage: {
      role: 'user';
      content: string;
      timestamp: string;
    };
    aiResponse: {
      role: 'assistant';
      content: string;
      timestamp: string;
      model: string;
      isPrism: boolean;
      perspectives?: Array<{
        perspective: string;
        content: string;
      }> | null;
      synthesis?: string | null;
    };
    model: string;
    isPrismMode: boolean;
  }>;
  modelsUsed: string[];
  perspectivesUsed: string[];
  totalMessages: number;
  prismInteractions: number;
  regularInteractions: number;
}

interface SessionSummaryData {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: string;
  totalMessages: number;
  prismInteractions: number;
  regularInteractions: number;
  modelsUsed: string[];
  perspectivesUsed: string[];
  lastActivity: string;
}

interface Analytics {
  totalSessions: number;
  totalMessages: number;
  totalPrismInteractions: number;
  totalRegularInteractions: number;
  prismUsageRate: string;
  uniqueModelsUsed: number;
  uniquePerspectivesUsed: number;
  modelUsageStats: Record<string, number>;
  perspectiveUsageStats: Record<string, number>;
  mostUsedModel: string;
  mostUsedPerspective: string;
}

interface LoggingDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoggingDashboard: React.FC<LoggingDashboardProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<SessionSummaryData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'analytics'>('sessions');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = (): void => {
    try {
      const sessionSummaries = loggingService.getAllSessionSummaries();
      const analyticsData = loggingService.getAnalytics();
      setSessions(sessionSummaries);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading logging data:', error);
      setSessions([]);
      setAnalytics(null);
    }
  };

  const handleSessionSelect = (sessionId: string): void => {
    const sessionDetails = loggingService.getSessionDetails(sessionId);
    setSelectedSession(sessionDetails);
  };

  const handleSessionDelete = (sessionId: string): void => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      loggingService.deleteSession(sessionId);
      loadData();
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  const handleSessionExport = (sessionId: string): void => {
    loggingService.exportSession(sessionId);
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleString();
  };

  if (!isOpen) return null;

  // Add error boundary
  try {
    return (
      <div className="logging-dashboard-overlay" onClick={(e) => {
        // Close when clicking overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
        <div className="logging-dashboard">
          <div className="dashboard-header">
            <h2>Session History & Analytics</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="dashboard-tabs">
            <button 
              className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions ({sessions.length})
            </button>
            <button 
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          <div className="dashboard-content">
            {activeTab === 'sessions' && (
              <div className="sessions-view">
                <div className="sessions-list">
                  <h3>Chat Sessions</h3>
                  {sessions.length === 0 ? (
                    <div className="empty-state">
                      <p>No sessions found. Start chatting to create your first session!</p>
                    </div>
                  ) : (
                    <div className="sessions-grid">
                      {sessions.map(session => (
                        <SessionSummary
                          key={session.id}
                          session={session}
                          onSelect={handleSessionSelect}
                          onDelete={handleSessionDelete}
                          onExport={handleSessionExport}
                          isSelected={selectedSession ? selectedSession.id === session.id : false}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {selectedSession && (
                  <div className="session-details">
                    <h3>Session Details</h3>
                    <div className="session-metadata">
                      <div className="metadata-row">
                        <span className="label">Session ID:</span>
                        <span className="value">{selectedSession.id}</span>
                      </div>
                      <div className="metadata-row">
                        <span className="label">Started:</span>
                        <span className="value">{formatDate(selectedSession.startTime)}</span>
                      </div>
                      <div className="metadata-row">
                        <span className="label">Ended:</span>
                        <span className="value">
                          {selectedSession.endTime ? formatDate(selectedSession.endTime) : 'Active'}
                        </span>
                      </div>
                      <div className="metadata-row">
                        <span className="label">Total Messages:</span>
                        <span className="value">{selectedSession.totalMessages}</span>
                      </div>
                      <div className="metadata-row">
                        <span className="label">Prism Interactions:</span>
                        <span className="value">{selectedSession.prismInteractions}</span>
                      </div>
                      <div className="metadata-row">
                        <span className="label">Models Used:</span>
                        <span className="value">
                          {(selectedSession.modelsUsed || []).join(', ') || 'None'}
                        </span>
                      </div>
                      <div className="metadata-row">
                        <span className="label">Perspectives Used:</span>
                        <span className="value perspective-list">
                          {(selectedSession.perspectivesUsed || []).length > 0 ? (
                            <div className="perspectives-tags">
                              {(selectedSession.perspectivesUsed || []).map(perspective => (
                                <span key={perspective} className="perspective-tag">
                                  {perspective}
                                </span>
                              ))}
                            </div>
                          ) : 'None'}
                        </span>
                      </div>
                    </div>

                    <div className="conversation-history">
                      <h4>Conversation History</h4>
                      <div className="messages-list">
                        {selectedSession.messages.map(messageEntry => (
                          <div key={messageEntry.id} className="message-entry">
                            <div className="message-header">
                              <span className="timestamp">{formatDate(messageEntry.timestamp)}</span>
                              <span className={`mode-badge ${messageEntry.isPrismMode ? 'prism' : 'standard'}`}>
                                {messageEntry.isPrismMode ? '◊ Prism' : 'Standard'}
                              </span>
                              <span className="model-badge">{messageEntry.model}</span>
                            </div>
                            
                            <div className="user-message">
                              <strong>User:</strong>
                              <p>{messageEntry.userMessage.content}</p>
                            </div>
                            
                            <div className="ai-response">
                              <strong>Assistant:</strong>
                              {messageEntry.isPrismMode && messageEntry.aiResponse.perspectives ? (
                                <div className="prism-response">
                                  <div className="perspectives-section">
                                    <h5>Perspectives Generated:</h5>
                                    {messageEntry.aiResponse.perspectives.map((perspective, idx) => (
                                      <div key={idx} className="perspective-response">
                                        <h6>{perspective.perspective}</h6>
                                        <p>{perspective.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="synthesis-section">
                                    <h5>Synthesized Response:</h5>
                                    <p>{messageEntry.aiResponse.synthesis}</p>
                                  </div>
                                </div>
                              ) : (
                                <p>{messageEntry.aiResponse.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && analytics && (
              <div className="analytics-view">
                <h3>Usage Analytics</h3>
                
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>Session Overview</h4>
                    <div className="stat-item">
                      <span className="stat-label">Total Sessions:</span>
                      <span className="stat-value">{analytics.totalSessions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Messages:</span>
                      <span className="stat-value">{analytics.totalMessages}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Prism Usage Rate:</span>
                      <span className="stat-value">{analytics.prismUsageRate}%</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h4>Interaction Types</h4>
                    <div className="stat-item">
                      <span className="stat-label">Prism Interactions:</span>
                      <span className="stat-value prism">{analytics.totalPrismInteractions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Standard Interactions:</span>
                      <span className="stat-value standard">{analytics.totalRegularInteractions}</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h4>Models & Perspectives</h4>
                    <div className="stat-item">
                      <span className="stat-label">Unique Models Used:</span>
                      <span className="stat-value">{analytics.uniqueModelsUsed}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Unique Perspectives:</span>
                      <span className="stat-value">{analytics.uniquePerspectivesUsed}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Most Used Model:</span>
                      <span className="stat-value">{analytics.mostUsedModel}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Most Used Perspective:</span>
                      <span className="stat-value">{analytics.mostUsedPerspective}</span>
                    </div>
                  </div>
                </div>

                <div className="usage-charts">
                  <div className="chart-section">
                    <h4>Model Usage Statistics</h4>
                    <div className="usage-list">
                      {Object.entries(analytics.modelUsageStats)
                        .sort((a, b) => b[1] - a[1])
                        .map(([model, count]) => (
                          <div key={model} className="usage-item">
                            <span className="usage-label">{model}</span>
                            <div className="usage-bar">
                              <div 
                                className="usage-fill"
                                style={{
                                  width: `${(count / Math.max(...Object.values(analytics.modelUsageStats))) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="usage-count">{count}</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(analytics.perspectiveUsageStats).length > 0 && (
                    <div className="chart-section">
                      <h4>Top Perspectives Used</h4>
                      <div className="usage-list">
                        {Object.entries(analytics.perspectiveUsageStats)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([perspective, count]) => (
                            <div key={perspective} className="usage-item">
                              <span className="usage-label">{perspective}</span>
                              <div className="usage-bar">
                                <div 
                                  className="usage-fill perspective"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(analytics.perspectiveUsageStats))) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="usage-count">{count}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering LoggingDashboard:', error);
    return (
      <div className="logging-dashboard-overlay" onClick={onClose}>
        <div className="logging-dashboard">
          <div className="dashboard-header">
            <h2>Error Loading Dashboard</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="dashboard-content">
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Sorry, there was an error loading the logging dashboard.</p>
              <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
              <button onClick={onClose} style={{ padding: '10px 20px', marginTop: '10px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default LoggingDashboard;