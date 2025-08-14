// components/admin/AIDataDebugger.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { AIData } from '@/app/hooks/AIDataUpdates';

interface ValidationResult {
  isValid: boolean;
  repaired: boolean;
  errors: string[];
}

export const AIDataDebugger: React.FC = () => {
  const [aiData, setAiData] = useState<AIData>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAIData = async () => {
    try {
      const response = await fetch('/api/ai-data');
      const data = await response.json();
      setAiData(data);
    } catch (error) {
      console.error('Error loading AI data:', error);
    }
  };

  const validateData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-data/validate', {
        method: 'POST'
      });
      const result = await response.json();
      setValidationResult(result);
      
      // Reload data after validation/repair
      await loadAIData();
    } catch (error) {
      console.error('Error validating AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAIData();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>AI Data Debugger</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={validateData}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Validating...' : 'Validate & Repair AI Data'}
        </button>
        
        <button 
          onClick={loadAIData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Data
        </button>
      </div>

      {validationResult && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: validationResult.isValid ? '#d1fae5' : '#fee2e2',
          borderRadius: '4px'
        }}>
          <h4>Validation Result:</h4>
          <p><strong>Valid:</strong> {validationResult.isValid ? 'Yes' : 'No'}</p>
          <p><strong>Repaired:</strong> {validationResult.repaired ? 'Yes' : 'No'}</p>
          {validationResult.errors.length > 0 && (
            <div>
              <strong>Issues:</strong>
              <ul>
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <h4>Current AI Data ({Object.keys(aiData).length} entries):</h4>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '400px',
          fontSize: '12px'
        }}>
          {JSON.stringify(aiData, null, 2)}
        </pre>
      </div>
    </div>
  );
};
