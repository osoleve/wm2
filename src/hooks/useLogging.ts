// React hook for logging functionality
import { useState, useCallback, useEffect } from 'react';
import loggingService from '../services/loggingService';

interface SessionSummary {
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

export const useLogging = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from logging service
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionSummaries = loggingService.getAllSessionSummaries();
      setSessions(sessionSummaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const analyticsData = loggingService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const success = loggingService.deleteSession(sessionId);
      if (success) {
        // Refresh sessions list
        await loadSessions();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      return false;
    }
  }, [loadSessions]);

  // Export a session
  const exportSession = useCallback((sessionId: string) => {
    try {
      loggingService.exportSession(sessionId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export session');
      return false;
    }
  }, []);

  // Get session details
  const getSessionDetails = useCallback((sessionId: string) => {
    try {
      return loggingService.getSessionDetails(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get session details');
      return null;
    }
  }, []);

  // Clear current session
  const clearCurrentSession = useCallback(async () => {
    try {
      loggingService.clearCurrentSession();
      await loadSessions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear session');
      return false;
    }
  }, [loadSessions]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadAnalytics();
  }, [loadSessions, loadAnalytics]);

  return {
    sessions,
    analytics,
    isLoading,
    error,
    loadSessions,
    loadAnalytics,
    deleteSession,
    exportSession,
    getSessionDetails,
    clearCurrentSession
  };
};