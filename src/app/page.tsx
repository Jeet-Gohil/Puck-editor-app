// app/editor/page.tsx
"use client";

import { Puck, Data } from "@measured/puck";
import { PuckConfig } from "./lib/Puck/config";
import { useState, useCallback, JSX } from 'react';
import { useAIDataWatcher, AIData } from "./hooks/AIDataUpdates";

export default function Editor(): JSX.Element {
  const [data, setData] = useState<Data>({
    content: [],
    root: {}
  });

  // Handle AI data changes and update Puck data
  const handleAIDataChange = useCallback((aiData: AIData): void => {
    setData(prevData => {
      const updatedData = { ...prevData };
      
      // Apply AI-generated content to existing elements
      updatedData.content = prevData.content.map(item => {
        const elementAIData = aiData[item.props.id];
        if (elementAIData) {
          const updatedProps = { ...item.props };
          
          // Update each field that has AI-generated content
          Object.entries(elementAIData).forEach(([fieldName, fieldData]) => {
            if (fieldData.generated) {
              updatedProps[fieldName] = fieldData.value;
            }
          });
          
          return { ...item, props: updatedProps };
        }
        return item;
      });
      
      return updatedData;
    });
  }, []);

  const { isWatching, setIsWatching } = useAIDataWatcher(handleAIDataChange);

  const handlePublish = useCallback((publishedData: Data): void => {
    console.log('Published data:', publishedData);
    // Add your publish logic here (save to database, deploy, etc.)
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Puck Editor with AI
          </h2>
          <span style={{
            padding: '4px 8px',
            backgroundColor: isWatching ? '#d4edda' : '#f8d7da',
            color: isWatching ? '#155724' : '#721c24',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {isWatching ? '🟢 Live Updates ON' : '🔴 Live Updates OFF'}
          </span>
        </div>
        
        <button
          onClick={() => setIsWatching(!isWatching)}
          style={{
            padding: '8px 16px',
            backgroundColor: isWatching ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isWatching ? 'Stop Live Updates' : 'Start Live Updates'}
        </button>
      </div>
      
      <Puck
        config={PuckConfig}
        data={data}
        onPublish={handlePublish}
        onChange={setData}
      />
    </div>
  );
}
