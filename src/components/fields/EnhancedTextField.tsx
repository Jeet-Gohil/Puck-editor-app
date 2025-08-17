/**
 * Enhanced Text Field Component with AI integration
 */
import React, { useState, useEffect, useRef } from 'react';
import { FieldLabel } from '@measured/puck';
import { AIGenerateButton } from '@/components/ui/AIGenerateButton';
import { useAIDataWatcher } from '@/hooks/useAIDataWatcher';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { EnhancedFieldProps, AIData } from '@/types';
import { UI_CONSTANTS } from '@/constants';

export const EnhancedTextField: React.FC<EnhancedFieldProps> = ({
  label,
  value,
  onChange,
  elementId,
  fieldName,
  fieldType,
  placeholder = '',
}) => {
  const [isUpdatingFromAI, setIsUpdatingFromAI] = useState(false);
  const lastAIUpdateRef = useRef<string>('');

  const aiDataKey = `${elementId}_custom_${fieldName}`;

  const handleAIDataChange = (aiData: AIData) => {
    if (aiData[aiDataKey] && aiData[aiDataKey][fieldName]) {
      const aiFieldData = aiData[aiDataKey][fieldName];
      const newValue = aiFieldData.value;
      const timestamp = aiFieldData.timestamp;

      console.log(`🔄 AI data change detected for ${fieldName}:`, newValue);

      if (timestamp !== lastAIUpdateRef.current && newValue !== value) {
        console.log(`✨ Updating field ${fieldName} with AI content:`, newValue);
        setIsUpdatingFromAI(true);
        lastAIUpdateRef.current = timestamp;
        onChange(newValue);

        setTimeout(() => setIsUpdatingFromAI(false), UI_CONSTANTS.ANIMATION_DURATION);
      }
    }
  };

  const { setIsWatching, triggerCheck } = useAIDataWatcher(handleAIDataChange);

  const { isGenerating, generateContent } = useAIGeneration({
    onSuccess: (content) => {
      console.log(`✅ AI generation successful for ${fieldName}:`, content);
      // Trigger immediate data check to get the latest content
      triggerCheck();
    },
    onError: (error) => {
      console.error(`❌ AI generation failed for ${fieldName}:`, error);
    }
  });

  useEffect(() => {
    setIsWatching(true);
    return () => setIsWatching(false);
  }, [setIsWatching]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel label={label} />
        <AIGenerateButton
          elementId={elementId}
          fieldName={fieldName}
          fieldType={fieldType}
          currentValue={value}
          onGenerated={onChange}
        />
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border rounded-md text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${
              isUpdatingFromAI
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }
          `}
        />
        
        {isUpdatingFromAI && (
          <div className="absolute -bottom-6 left-0 text-xs text-green-600 font-medium">
            ✓ Updated from AI data
          </div>
        )}
      </div>
    </div>
  );
};
