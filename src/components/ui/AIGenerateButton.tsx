/**
 * AI Generate Button Component - Handles AI content generation
 */
import React, { useState } from 'react';
import { AIGenerateButtonProps } from '@/types';
import { useAIGeneration } from '@/hooks/useAIGeneration';

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  elementId,
  fieldName,
  fieldType,
  currentValue,
  onGenerated,
}) => {
  const [generationStatus, setGenerationStatus] = useState<string>('');

  const { isGenerating, generateContent } = useAIGeneration({
    onSuccess: (content) => {
      console.log(`✅ AI generation successful for ${fieldName}:`, content);
      onGenerated(content);
      setGenerationStatus('');
    },
    onError: (error) => {
      console.error(`❌ AI generation failed for ${fieldName}:`, error);
      setGenerationStatus(`Error: ${error.message}`);
    }
  });

  const handleAIGenerate = async (): Promise<void> => {
    setGenerationStatus('Generating...');

    try {
      await generateContent({
        elementId,
        fieldName,
        fieldType,
        currentValue,
      });
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleAIGenerate}
        disabled={isGenerating}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md
          transition-all duration-200 border
          ${
            isGenerating
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 cursor-pointer'
          }
        `}
        title={isGenerating ? 'Generating content from SSE server...' : 'Generate content with AI'}
      >
        <span className="text-sm">🤖</span>
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⚡</span>
            Generating...
          </span>
        ) : (
          'Generate with AI'
        )}
      </button>

      {/* Status indicator */}
      {(isGenerating || generationStatus) && (
        <div className="text-xs text-gray-600 italic">
          {generationStatus || 'Processing...'}
        </div>
      )}
    </div>
  );
};
