/**
 * Field Debugger Component - Helps debug field updates in Puck editor
 */
import React, { useState } from 'react';
import { debugPuckFields, findAllPuckFields, updatePuckField } from '@/utils/puckFieldUpdater';
import { debugPuckData, updatePuckData } from '@/utils/puckDataUpdater';

export const FieldDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [fields, setFields] = useState<Array<{ element: HTMLElement; name: string }>>([]);

  const handleRefreshFields = () => {
    const foundFields = findAllPuckFields();
    setFields(foundFields);
    debugPuckFields();
  };

  const handleTestUpdate = (fieldName: string) => {
    const testValue = `Test update at ${new Date().toLocaleTimeString()}`;
    const fieldSuccess = updatePuckField('test-element', fieldName, testValue);
    const puckSuccess = updatePuckData('test-element', fieldName, testValue);
    console.log(`Test field update for ${fieldName}: ${fieldSuccess ? 'success' : 'failed'}`);
    console.log(`Test Puck update for ${fieldName}: ${puckSuccess ? 'success' : 'failed'}`);
  };

  const handleTestRealUpdate = () => {
    // Test with a real element ID from the logs
    const realElementId = 'HeroSectionOne-1fe7fe8-5b3-4993-9f33-7579ce87a75c_custom_navbarBrand';
    const testValue = `Real test at ${new Date().toLocaleTimeString()}`;
    const fieldSuccess = updatePuckField(realElementId, 'navbarBrand', testValue);
    const puckSuccess = updatePuckData(realElementId, 'navbarBrand', testValue);
    console.log(`Real test field update: ${fieldSuccess ? 'success' : 'failed'}`);
    console.log(`Real test Puck update: ${puckSuccess ? 'success' : 'failed'}`);
  };

  const handleDebugPuckData = () => {
    debugPuckData();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-2 rounded-lg text-xs z-50"
        title="Open Field Debugger"
      >
        🔍 Debug Fields
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Field Debugger</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <button
            onClick={handleRefreshFields}
            className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Refresh Fields ({fields.length})
          </button>

          <button
            onClick={handleDebugPuckData}
            className="w-full bg-purple-600 text-white px-3 py-1 rounded text-xs"
          >
            Debug Puck Data
          </button>

          <button
            onClick={handleTestRealUpdate}
            className="w-full bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            Test Real Element
          </button>
        </div>

        <div className="max-h-48 overflow-auto">
          {fields.map((field, index) => (
            <div key={index} className="border border-gray-200 rounded p-2 text-xs">
              <div className="font-medium">{field.name}</div>
              <div className="text-gray-600">
                Type: {field.element.tagName.toLowerCase()}
              </div>
              <div className="text-gray-600 truncate">
                Value: {(field.element as HTMLInputElement).value || '(empty)'}
              </div>
              <button
                onClick={() => handleTestUpdate(field.name)}
                className="mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs"
              >
                Test Update
              </button>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-gray-500 text-xs text-center py-4">
            No fields found. Click "Refresh Fields" to scan.
          </div>
        )}
      </div>
    </div>
  );
};
