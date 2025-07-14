// Local session logging service for chat conversations
class LoggingService {
  constructor() {
    this.storageKey = 'prism-chat-sessions';
    this.currentSessionId = null;
    this.initializeSession();
  }

  // Generate a unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize a new session
  initializeSession() {
    this.currentSessionId = this.generateSessionId();
    const session = {
      id: this.currentSessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      messages: [],
      modelsUsed: new Set(),
      perspectivesUsed: new Set(),
      totalMessages: 0,
      prismInteractions: 0,
      regularInteractions: 0
    };
    
    this.saveSession(session);
    console.log('🗂️ New session initialized:', this.currentSessionId);
  }

  // Log a message exchange
  logMessage(userMessage, aiResponse, model, isPrismMode = false) {
    if (!this.currentSessionId) {
      this.initializeSession();
    }

    const session = this.getCurrentSession();
    if (!session) return;

    const messageEntry = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      userMessage: {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      },
      aiResponse: {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        model: model,
        isPrism: isPrismMode,
        perspectives: aiResponse.perspectives || null,
        synthesis: aiResponse.synthesis || null
      },
      model: model,
      isPrismMode: isPrismMode
    };

    // Update session data
    session.messages.push(messageEntry);
    session.totalMessages += 1;
    session.modelsUsed.add(model);
    
    if (isPrismMode) {
      session.prismInteractions += 1;
      if (aiResponse.perspectives) {
        aiResponse.perspectives.forEach(p => {
          session.perspectivesUsed.add(p.perspective);
        });
      }
    } else {
      session.regularInteractions += 1;
    }

    session.endTime = new Date().toISOString();

    // Convert Sets to Arrays for storage
    const sessionToSave = {
      ...session,
      modelsUsed: Array.from(session.modelsUsed),
      perspectivesUsed: Array.from(session.perspectivesUsed)
    };

    this.saveSession(sessionToSave);
    console.log('📝 Message logged:', messageEntry.id);
  }

  // Save session to localStorage
  saveSession(session) {
    try {
      const sessions = this.getAllSessions();
      sessions[session.id] = session;
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Get current session
  getCurrentSession() {
    try {
      const sessions = this.getAllSessions();
      const session = sessions[this.currentSessionId];
      
      if (session) {
        // Convert arrays back to Sets for internal use, with proper validation
        const modelsUsed = Array.isArray(session.modelsUsed) ? session.modelsUsed : [];
        const perspectivesUsed = Array.isArray(session.perspectivesUsed) ? session.perspectivesUsed : [];
        
        return {
          ...session,
          modelsUsed: new Set(modelsUsed),
          perspectivesUsed: new Set(perspectivesUsed)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      // If there's an error, try to recover by clearing corrupted session data
      this.clearCurrentSession();
      this.initializeSession();
      return this.getCurrentSession();
    }
  }

  // Get all sessions from localStorage
  getAllSessions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const sessions = stored ? JSON.parse(stored) : {};
      
      // Validate and clean up session data
      const validSessions = {};
      Object.keys(sessions).forEach(sessionId => {
        const session = sessions[sessionId];
        if (session && typeof session === 'object') {
          // Ensure required arrays exist and are arrays
          validSessions[sessionId] = {
            ...session,
            modelsUsed: Array.isArray(session.modelsUsed) ? session.modelsUsed : [],
            perspectivesUsed: Array.isArray(session.perspectivesUsed) ? session.perspectivesUsed : [],
            messages: Array.isArray(session.messages) ? session.messages : []
          };
        }
      });
      
      return validSessions;
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Clear corrupted data
      localStorage.removeItem(this.storageKey);
      return {};
    }
  }

  // Get session summary for display
  getSessionSummary(sessionId = null) {
    const targetSessionId = sessionId || this.currentSessionId;
    const sessions = this.getAllSessions();
    const session = sessions[targetSessionId];
    
    if (!session) return null;

    return {
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: this.calculateDuration(session.startTime, session.endTime),
      totalMessages: session.totalMessages,
      prismInteractions: session.prismInteractions,
      regularInteractions: session.regularInteractions,
      modelsUsed: session.modelsUsed || [],
      perspectivesUsed: session.perspectivesUsed || [],
      lastActivity: session.messages.length > 0 ? 
        session.messages[session.messages.length - 1].timestamp : session.startTime
    };
  }

  // Calculate session duration
  calculateDuration(startTime, endTime) {
    if (!endTime) return 'Active';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Get all session summaries sorted by most recent
  getAllSessionSummaries() {
    const sessions = this.getAllSessions();
    return Object.values(sessions)
      .map(session => this.getSessionSummary(session.id))
      .filter(summary => summary !== null)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  // Get detailed session data
  getSessionDetails(sessionId) {
    const sessions = this.getAllSessions();
    return sessions[sessionId] || null;
  }

  // Clear current session (start fresh)
  clearCurrentSession() {
    this.initializeSession();
    console.log('🔄 Session cleared, new session started');
  }

  // Delete a specific session
  deleteSession(sessionId) {
    try {
      const sessions = this.getAllSessions();
      if (sessions[sessionId]) {
        delete sessions[sessionId];
        localStorage.setItem(this.storageKey, JSON.stringify(sessions));
        console.log('🗑️ Session deleted:', sessionId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Export session data
  exportSession(sessionId) {
    const session = this.getSessionDetails(sessionId);
    if (!session) return null;

    const exportData = {
      ...session,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prism-session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📤 Session exported:', sessionId);
  }

  // Get analytics data
  getAnalytics() {
    const sessions = this.getAllSessions();
    const allSessions = Object.values(sessions);
    
    const totalSessions = allSessions.length;
    const totalMessages = allSessions.reduce((sum, s) => sum + (s.totalMessages || 0), 0);
    const totalPrismInteractions = allSessions.reduce((sum, s) => sum + (s.prismInteractions || 0), 0);
    const totalRegularInteractions = allSessions.reduce((sum, s) => sum + (s.regularInteractions || 0), 0);
    
    // Get all unique models and perspectives used
    const allModels = new Set();
    const allPerspectives = new Set();
    
    allSessions.forEach(session => {
      (session.modelsUsed || []).forEach(model => allModels.add(model));
      (session.perspectivesUsed || []).forEach(perspective => allPerspectives.add(perspective));
    });

    // Calculate usage statistics
    const modelUsageStats = {};
    const perspectiveUsageStats = {};
    
    allSessions.forEach(session => {
      (session.modelsUsed || []).forEach(model => {
        modelUsageStats[model] = (modelUsageStats[model] || 0) + 1;
      });
      (session.perspectivesUsed || []).forEach(perspective => {
        perspectiveUsageStats[perspective] = (perspectiveUsageStats[perspective] || 0) + 1;
      });
    });

    return {
      totalSessions,
      totalMessages,
      totalPrismInteractions,
      totalRegularInteractions,
      prismUsageRate: totalMessages > 0 ? (totalPrismInteractions / totalMessages * 100).toFixed(1) : 0,
      uniqueModelsUsed: allModels.size,
      uniquePerspectivesUsed: allPerspectives.size,
      modelUsageStats,
      perspectiveUsageStats,
      mostUsedModel: Object.entries(modelUsageStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None',
      mostUsedPerspective: Object.entries(perspectiveUsageStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
    };
  }
}

export default new LoggingService();