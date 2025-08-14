// components/puck/AIEnhancedFields.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FieldLabel } from '@measured/puck';
import { useAIDataWatcher, AIData } from '@/app/hooks/AIDataUpdates';

interface AIGenerateButtonProps {
  elementId: string;
  fieldName: string;
  fieldType: string;
  currentValue?: string;
  onGenerated: (value: string) => void;
}

const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  elementId,
  fieldName,
  fieldType,
  currentValue,
  onGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleAIGenerate = async (): Promise<void> => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elementId,
          fieldName,
          fieldType,
          currentValue
        })
      });

      const result = await response.json();
      
      if (result.success && result.generatedValue) {
        onGenerated(result.generatedValue);
      } else {
        console.error('AI generation failed:', result.message);
        alert('Failed to generate AI content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Error generating AI content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAIGenerate}
      disabled={isGenerating}
      style={{
        background: isGenerating ? "#9ca3af" : "#4f46e5",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: isGenerating ? "not-allowed" : "pointer",
        marginLeft: "8px",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        transition: "background-color 0.2s"
      }}
    >
      🤖 {isGenerating ? 'Generating...' : 'Generate with AI'}
    </button>
  );
};

interface EnhancedTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  elementId: string;
  fieldName: string;
  fieldType: string;
  placeholder?: string;
}

export const EnhancedTextField: React.FC<EnhancedTextFieldProps> = ({
  label,
  value,
  onChange,
  elementId,
  fieldName,
  fieldType,
  placeholder
}) => {
  const [isUpdatingFromAI, setIsUpdatingFromAI] = useState(false);
  const lastAIUpdateRef = useRef<string>('');

  // Create a unique key for this field in the AI data
  const aiDataKey = `${elementId}_custom_${fieldName}`;

  // Handle AI data changes
  const handleAIDataChange = (aiData: AIData) => {
    if (aiData[aiDataKey] && aiData[aiDataKey][fieldName]) {
      const aiFieldData = aiData[aiDataKey][fieldName];
      const newValue = aiFieldData.value;
      const timestamp = aiFieldData.timestamp;

      // Only update if this is a new timestamp and different from current value
      if (timestamp !== lastAIUpdateRef.current && newValue !== value) {
        setIsUpdatingFromAI(true);
        lastAIUpdateRef.current = timestamp;
        onChange(newValue);

        // Reset the flag after a short delay
        setTimeout(() => setIsUpdatingFromAI(false), 500);
      }
    }
  };

  // Use the AI data watcher
  const { setIsWatching } = useAIDataWatcher(handleAIDataChange);

  // Start watching when component mounts
  useEffect(() => {
    setIsWatching(true);
    return () => setIsWatching(false);
  }, [setIsWatching]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <FieldLabel label={label} />
        <AIGenerateButton
          elementId={elementId}
          fieldName={fieldName}
          fieldType={fieldType}
          currentValue={value}
          onGenerated={onChange}
        />
        {isUpdatingFromAI && (
          <span style={{
            marginLeft: '8px',
            fontSize: '12px',
            color: '#10b981',
            fontWeight: 'bold'
          }}>
            ✓ Updated from AI data
          </span>
        )}
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px',
          border: isUpdatingFromAI ? '2px solid #10b981' : '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          transition: 'border-color 0.3s ease'
        }}
      />
    </div>
  );
};

interface EnhancedTextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  elementId: string;
  fieldName: string;
  fieldType: string;
  placeholder?: string;
  rows?: number;
}

export const EnhancedTextAreaField: React.FC<EnhancedTextAreaFieldProps> = ({
  label,
  value,
  onChange,
  elementId,
  fieldName,
  fieldType,
  placeholder,
  rows = 4
}) => {
  const [isUpdatingFromAI, setIsUpdatingFromAI] = useState(false);
  const lastAIUpdateRef = useRef<string>('');

  // Create a unique key for this field in the AI data
  const aiDataKey = `${elementId}_custom_${fieldName}`;

  // Handle AI data changes
  const handleAIDataChange = (aiData: AIData) => {
    if (aiData[aiDataKey] && aiData[aiDataKey][fieldName]) {
      const aiFieldData = aiData[aiDataKey][fieldName];
      const newValue = aiFieldData.value;
      const timestamp = aiFieldData.timestamp;

      // Only update if this is a new timestamp and different from current value
      if (timestamp !== lastAIUpdateRef.current && newValue !== value) {
        setIsUpdatingFromAI(true);
        lastAIUpdateRef.current = timestamp;
        onChange(newValue);

        // Reset the flag after a short delay
        setTimeout(() => setIsUpdatingFromAI(false), 500);
      }
    }
  };

  // Use the AI data watcher
  const { setIsWatching } = useAIDataWatcher(handleAIDataChange);

  // Start watching when component mounts
  useEffect(() => {
    setIsWatching(true);
    return () => setIsWatching(false);
  }, [setIsWatching]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <FieldLabel label={label} />
        <AIGenerateButton
          elementId={elementId}
          fieldName={fieldName}
          fieldType={fieldType}
          currentValue={value}
          onGenerated={onChange}
        />
        {isUpdatingFromAI && (
          <span style={{
            marginLeft: '8px',
            fontSize: '12px',
            color: '#10b981',
            fontWeight: 'bold'
          }}>
            ✓ Updated from AI data
          </span>
        )}
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '8px',
          border: isUpdatingFromAI ? '2px solid #10b981' : '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          resize: 'vertical',
          transition: 'border-color 0.3s ease'
        }}
      />
    </div>
  );
};
