/**
 * AI Data Watcher Hook - Monitors changes in AI-generated content
 * Optimized version with better error handling and performance
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { AIData, UseAIDataWatcherReturn } from '@/types';
import { API_ENDPOINTS, POLLING_INTERVALS } from '@/constants';

export const useAIDataWatcher = (
  onDataChange: (data: AIData) => void,
  options: { enablePolling?: boolean } = { enablePolling: true }
): UseAIDataWatcherReturn => {
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isAIActive, setIsAIActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const checkForUpdates = useCallback(async (): Promise<void> => {
    try {
      console.log('📡 Checking for AI data updates...');
      const response = await fetch(API_ENDPOINTS.AI_DATA);

      if (!response.ok) {
        console.error(`❌ AI data fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AIData = await response.json();
      console.log('✅ AI data fetched successfully:', Object.keys(data).length, 'elements');
      
      // Check if data has changed based on timestamps
      const latestTimestamp = Object.values(data)
        .flatMap(fields => Object.values(fields))
        .map(field => field.timestamp)
        .sort()
        .pop() || '';

      if (latestTimestamp !== lastUpdate) {
        setLastUpdate(latestTimestamp);
        lastActivityRef.current = Date.now();
        setIsAIActive(true);
        onDataChange(data);

        // Reset AI active state after 30 seconds of no updates
        setTimeout(() => {
          const timeSinceLastActivity = Date.now() - lastActivityRef.current;
          if (timeSinceLastActivity >= 30000) {
            setIsAIActive(false);
          }
        }, 30000);
      }
    } catch (error) {
      console.error('❌ Error checking for AI data updates:', error);
      // Don't throw the error to prevent breaking the polling loop
    }
  }, [onDataChange, lastUpdate]);

  useEffect(() => {
    if (isWatching && options.enablePolling) {
      // Use adaptive polling interval based on AI activity
      const pollInterval = isAIActive
        ? POLLING_INTERVALS.AI_DATA_WATCHER_ACTIVE  // 3 seconds when AI is active
        : POLLING_INTERVALS.AI_DATA_WATCHER_IDLE;   // 30 seconds when idle

      console.log(`📊 Polling AI data every ${pollInterval/1000}s (${isAIActive ? 'ACTIVE' : 'IDLE'} mode)`);

      intervalRef.current = setInterval(checkForUpdates, pollInterval);
      // Initial check
      checkForUpdates();
    } else {
      // Clear interval when not watching or polling disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (!options.enablePolling) {
        console.log('📊 AI data polling disabled');
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWatching, isAIActive, checkForUpdates, options.enablePolling]);

  // Manual trigger for immediate check (useful when AI generation starts)
  const triggerCheck = useCallback(() => {
    setIsAIActive(true);
    lastActivityRef.current = Date.now();
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    isWatching,
    setIsWatching,
    triggerCheck,
    isAIActive
  };
};
