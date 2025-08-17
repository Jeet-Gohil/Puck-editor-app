/**
 * AI Configuration Panel - Allows testing and configuring AI API
 */
"use client";

import React, { useState } from 'react';

interface AITestResult {
  success: boolean;
  message: string;
  generatedContent?: string;
  error?: string;
  timestamp: string;
}

export const AIConfigPanel: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingGeneration, setIsTestingGeneration] = useState(false);
  const [connectionResult, setConnectionResult] = useState<AITestResult | null>(null);
  const [generationResult, setGenerationResult] = useState<AITestResult | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const response = await fetch('/api/ai-test', {
        method: 'GET',
      });

      const result = await response.json();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Failed to test AI connection',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testGeneration = async () => {
    setIsTestingGeneration(true);
    setGenerationResult(null);

    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
      });

      const result = await response.json();
      setGenerationResult(result);
    } catch (error) {
      setGenerationResult({
        success: false,
        message: 'Failed to test AI generation',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTestingGeneration(false);
    }
  };

  const ResultDisplay: React.FC<{ result: AITestResult; title: string }> = ({ result, title }) => (
    <div className="mt-4 p-4 border rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className={`p-3 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {result.success ? '✅ Success' : '❌ Failed'}
        </div>
        <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
          {result.message}
        </div>
        {result.generatedContent && (
          <div className="mt-2 p-2 bg-white border rounded text-sm text-gray-800">
            <strong>Generated Content:</strong> "{result.generatedContent}"
          </div>
        )}
        {result.error && (
          <div className="mt-2 text-xs text-red-600">
            <strong>Error:</strong> {result.error}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">
          {new Date(result.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">AI SSE Server Configuration & Testing</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">SSE Server Configuration</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• <code>AI_API_ENDPOINT</code>: Your Python SSE server endpoint URL (required)</div>
            <div>• <code>BUSINESS_DESCRIPTION</code>: Business context for AI generation (required)</div>
            <div>• <code>AI_MODEL</code>: AI model name (optional)</div>
            <div>• <code>AI_MAX_TOKENS</code>: Maximum tokens (optional)</div>
            <div>• <code>AI_TEMPERATURE</code>: Generation temperature (optional)</div>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            Your SSE server will receive: <code>{`{"elementid": "abc123", "field": "title", "business_description": "...", "prompt": "..."}`}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className={`
                w-full px-4 py-2 rounded-md font-medium text-sm transition-colors
                ${isTestingConnection
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isTestingConnection ? 'Testing SSE Connection...' : 'Test SSE Connection'}
            </button>
          </div>

          <div>
            <button
              onClick={testGeneration}
              disabled={isTestingGeneration}
              className={`
                w-full px-4 py-2 rounded-md font-medium text-sm transition-colors
                ${isTestingGeneration
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
              `}
            >
              {isTestingGeneration ? 'Testing SSE Streaming...' : 'Test SSE Generation'}
            </button>
          </div>
        </div>

        {connectionResult && (
          <ResultDisplay result={connectionResult} title="Connection Test Result" />
        )}

        {generationResult && (
          <ResultDisplay result={generationResult} title="Generation Test Result" />
        )}

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">SSE Integration Notes</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>1. Your SSE server should stream responses with <code>text/event-stream</code> content type.</p>
            <p>2. Send completion signal with <code>data: [DONE]</code> to end the stream.</p>
            <p>3. The system supports multiple SSE data formats (see SSE_INTEGRATION_GUIDE.md).</p>
            <p>4. SSE timeout is set to 60 seconds for streaming responses.</p>
            <p>5. Check browser console for detailed SSE connection logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
