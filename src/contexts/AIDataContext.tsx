/**
 * AI Data Context - Global state management for AI data polling
 * Provides smart polling that adapts to AI generation activity
 */
'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AIData } from '@/types';
import { API_ENDPOINTS, POLLING_INTERVALS } from '@/constants';

interface AIDataContextType {
  aiData: AIData;
  isPolling: boolean;
  isAIActive: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  triggerAIActivity: () => void;
  refreshData: () => Promise<void>;
}

const AIDataContext = createContext<AIDataContextType | undefined>(undefined);

export const useAIData = () => {
  const context = useContext(AIDataContext);
  if (!context) {
    throw new Error('useAIData must be used within an AIDataProvider');
  }
  return context;
};

interface AIDataProviderProps {
  children: React.ReactNode;
  onDataChange?: (data: AIData) => void;
}

export const AIDataProvider: React.FC<AIDataProviderProps> = ({ children, onDataChange }) => {
  const [aiData, setAIData] = useState<AIData>({});
  const [isPolling, setIsPolling] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastDataHashRef = useRef<string>('');

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(API_ENDPOINTS.AI_DATA);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newData: AIData = await response.json();
      const newDataHash = JSON.stringify(newData);
      
      // Only update if data actually changed
      if (newDataHash !== lastDataHashRef.current) {
        lastDataHashRef.current = newDataHash;
        setAIData(newData);
        
        // Check if there's new AI-generated content
        const latestTimestamp = Object.values(newData)
          .flatMap(fields => Object.values(fields))
          .map(field => field.timestamp)
          .sort()
          .pop() || '';
        
        if (latestTimestamp) {
          lastActivityRef.current = Date.now();
          setIsAIActive(true);
          
          // Reset AI active state after 30 seconds of no updates
          setTimeout(() => {
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            if (timeSinceLastActivity >= 30000) {
              setIsAIActive(false);
            }
          }, 30000);
        }
        
        // Notify parent component
        onDataChange?.(newData);
      }
    } catch (error) {
      console.error('Error refreshing AI data:', error);
    }
  }, [onDataChange]);

  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    console.log('📊 Starting AI data polling');
    
    // Initial data fetch
    refreshData();
  }, [isPolling, refreshData]);

  const stopPolling = useCallback(() => {
    if (!isPolling) return;
    
    setIsPolling(false);
    setIsAIActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('📊 Stopped AI data polling');
  }, [isPolling]);

  const triggerAIActivity = useCallback(() => {
    setIsAIActive(true);
    lastActivityRef.current = Date.now();
    refreshData();
    console.log('🚀 AI activity triggered - switching to active polling');
  }, [refreshData]);

  // Adaptive polling effect
  useEffect(() => {
    if (!isPolling) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Use adaptive polling interval based on AI activity
    const pollInterval = isAIActive 
      ? POLLING_INTERVALS.AI_DATA_WATCHER_ACTIVE  // 2 seconds when AI is active
      : POLLING_INTERVALS.AI_DATA_WATCHER_IDLE;   // 10 seconds when idle
    
    console.log(`📊 Polling AI data every ${pollInterval/1000}s (${isAIActive ? 'ACTIVE' : 'IDLE'} mode)`);
    
    intervalRef.current = setInterval(refreshData, pollInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, isAIActive, refreshData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const value: AIDataContextType = {
    aiData,
    isPolling,
    isAIActive,
    startPolling,
    stopPolling,
    triggerAIActivity,
    refreshData,
  };

  return (
    <AIDataContext.Provider value={value}>
      {children}
    </AIDataContext.Provider>
  );
};
