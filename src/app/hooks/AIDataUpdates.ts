// hooks/useAIDataWatcher.ts
import { useState, useEffect, useCallback } from 'react';

export interface AIFieldData {
  value: string;
  timestamp: string;
  generated: boolean;
  fieldType: string;
}

export interface AIData {
  [elementId: string]: {
    [fieldName: string]: AIFieldData;
  };
}

interface UseAIDataWatcherReturn {
  isWatching: boolean;
  setIsWatching: (watching: boolean) => void;
}

export const useAIDataWatcher = (onDataChange: (data: AIData) => void): UseAIDataWatcherReturn => {
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const checkForUpdates = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/ai-data');
      const data: AIData = await response.json();
      
      // Check if data has changed based on timestamps
      const latestTimestamp = Object.values(data)
        .flatMap(fields => Object.values(fields))
        .map(field => field.timestamp)
        .sort()
        .pop() || '';

      if (latestTimestamp !== lastUpdate) {
        setLastUpdate(latestTimestamp);
        onDataChange(data);
      }
    } catch (error) {
      console.error('Error checking for AI data updates:', error);
    }
  }, [onDataChange, lastUpdate]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isWatching) {
      // Check for updates every 3 seconds
      intervalId = setInterval(checkForUpdates, 3000);
      // Initial check
      checkForUpdates();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isWatching, checkForUpdates]);

  return { isWatching, setIsWatching };
};
