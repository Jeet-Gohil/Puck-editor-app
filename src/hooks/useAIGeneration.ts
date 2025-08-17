/**
 * AI Generation Hook - Handles AI content generation with smart polling
 */
import { useState, useCallback } from 'react';

interface UseAIGenerationProps {
  onSuccess?: (content: string) => void;
  onError?: (error: Error) => void;
}

interface UseAIGenerationReturn {
  isGenerating: boolean;
  generateContent: (params: {
    elementId: string;
    fieldName: string;
    fieldType: string;
    currentValue?: string;
  }) => Promise<string>;
}

export const useAIGeneration = ({ onSuccess, onError }: UseAIGenerationProps = {}): UseAIGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = useCallback(async (params: {
    elementId: string;
    fieldName: string;
    fieldType: string;
    currentValue?: string;
  }): Promise<string> => {
    if (isGenerating) {
      throw new Error('AI generation already in progress');
    }

    setIsGenerating(true);
    console.log('🚀 Starting AI generation for:', params.elementId, params.fieldName);

    try {
      const response = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'AI generation failed');
      }

      // Extract the generated content
      const generatedFields = result.generatedFields;
      const fieldData = generatedFields[params.fieldName];
      const content = fieldData?.value || '';

      console.log('✅ AI generation completed:', content);
      onSuccess?.(content);
      
      return content;

    } catch (error) {
      console.error('❌ AI generation failed:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      onError?.(errorObj);
      throw errorObj;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, onSuccess, onError]);

  return {
    isGenerating,
    generateContent,
  };
};
