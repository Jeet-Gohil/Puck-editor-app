// app/test/page.tsx
"use client";

import React from 'react';
import { AIDataDebugger } from '@/app/Components/admin/AIDataDebugger';

export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>AI Data Two-Way Sync Test Page</h1>
      
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #0ea5e9'
      }}>
        <h2>How to Test Two-Way Sync:</h2>
        <ol>
          <li><strong>Test Puck → JSON:</strong> Go to the main page (<a href="/" target="_blank">localhost:3000</a>) and click "Generate with AI" on any field. Check the JSON below to see the new data.</li>
          <li><strong>Test JSON → Puck:</strong> Use the debugger below to validate the JSON, then manually edit the JSON file and refresh the main page to see changes reflected in Puck.</li>
          <li><strong>Manual JSON Edit:</strong> Edit <code>data/ai-generated-content.json</code> directly and watch the fields update in real-time (every 3 seconds).</li>
        </ol>
      </div>

      <div style={{ 
        backgroundColor: '#fef3c7', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #f59e0b'
      }}>
        <h3>⚠️ Important Notes:</h3>
        <ul>
          <li>The AI data watcher polls every 3 seconds for changes</li>
          <li>Element IDs must match the format: <code>ComponentName-uuid_custom_fieldName</code></li>
          <li>JSON structure must be valid - use the validator below if you encounter errors</li>
          <li>Changes will show a green "✓ Updated from AI data" indicator in Puck</li>
        </ul>
      </div>

      <AIDataDebugger />
      
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h3>Example JSON Entry for Testing:</h3>
        <pre style={{ 
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`"HeroSectionOne-test-123_custom_title": {
  "title": {
    "value": "Your Test Title Here",
    "timestamp": "${new Date().toISOString()}",
    "generated": true,
    "fieldType": "title"
  }
}`}
        </pre>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
          Copy this structure and add it to the JSON file to test manual editing.
        </p>
      </div>
    </div>
  );
}
