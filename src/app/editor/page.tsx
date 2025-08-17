/**
 * Puck Editor Page - Main editor interface
 * Optimized version with better structure and performance
 */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Puck, Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { PuckConfig } from "@/config/puck";
import { useAIDataWatcher } from "@/hooks/useAIDataWatcher";
import { AIData } from "@/types";
import { FieldDebugger } from "@/components/debug/FieldDebugger";
import { registerPuckDataSetter, unregisterPuckDataSetter } from "@/utils/puckDataUpdater";

/**
 * Helper function to update element fields with AI data
 */
function updateElementFields(
  prevData: Data,
  elementId: string,
  generatedFields: Record<string, string>
): Data {
  return {
    ...prevData,
    content: prevData.content.map((item) =>
      item.props.id === elementId
        ? {
            ...item,
            props: { ...item.props, ...generatedFields },
          }
        : item
    ),
  };
}

export default function EditorPage() {
  const [data, setData] = useState<Data>({
    content: [],
    root: { props: { title: "Puck Editor" } },
  });

  const [isWatching, setIsWatching] = useState<boolean>(true);

  // Register the Puck data setter for real-time updates
  useEffect(() => {
    registerPuckDataSetter(setData);
    console.log('🎯 Puck editor data setter registered for real-time updates');

    return () => {
      unregisterPuckDataSetter();
      console.log('🎯 Puck editor data setter unregistered');
    };
  }, []);

  const handleAIResponse = useCallback((aiData: AIData) => {
    setData((prevData) => {
      let updatedData = prevData;

      Object.entries(aiData).forEach(([elementKey, fields]) => {
        // Extract elementId from the key format: "ElementType-uuid_custom_fieldName"
        const elementId = elementKey.split('_custom_')[0];
        
        // Convert AI field data to simple field values
        const generatedFields: Record<string, string> = {};
        Object.entries(fields).forEach(([fieldName, fieldData]) => {
          generatedFields[fieldName] = fieldData.value;
        });

        updatedData = updateElementFields(updatedData, elementId, generatedFields);
      });

      return updatedData;
    });
  }, []);

  const { setIsWatching: setAIWatching } = useAIDataWatcher(
    handleAIResponse,
    { enablePolling: true } // Enable polling but with reduced frequency
  );

  const handlePublish = useCallback((data: Data) => {
    console.log("Publishing data:", data);
    // Here you would typically save the data to your backend
  }, []);

  const toggleWatching = useCallback(() => {
    const newWatchingState = !isWatching;
    setIsWatching(newWatchingState);
    setAIWatching(newWatchingState);
  }, [isWatching, setAIWatching]);

  return (
    <div className="h-screen">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          Puck Editor
        </h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleWatching}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                isWatching
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }
            `}
          >
            {isWatching ? 'Stop Live Updates' : 'Start Live Updates'}
          </button>
          
          <div className="text-sm text-gray-500">
            AI Sync: {isWatching ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="h-[calc(100vh-64px)]">
        <Puck
          config={PuckConfig}
          data={data}
          onPublish={handlePublish}
          onChange={setData}
        />
      </div>

      {/* Field Debugger for development */}
      
    </div>
  );
}
