/**
 * Centralized type definitions for the Puck Editor application
 */

// AI Data Types
export interface AIFieldData {
  value: string;
  timestamp: string;
  generated: boolean;
  fieldType: string;
}

export interface AIData {
  [elementId: string]: {
    [fieldName: string]: AIFieldData;
  };
}

// Component Props Types
export interface HeroSectionProps {
  navbarBrand?: string;
  navbarButtonText?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  imageSrc?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  features: Feature[];
}

// Field Enhancement Types
export interface AIGenerateButtonProps {
  elementId: string;
  fieldName: string;
  fieldType: string;
  currentValue?: string;
  onGenerated: (value: string) => void;
}

export interface EnhancedFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  elementId: string;
  fieldName: string;
  fieldType: string;
  placeholder?: string;
  rows?: number;
}

// AI API Configuration Types
export interface AIAPIConfig {
  endpoint: string;
  streamEndpoint?: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// AI API Request Types (for internal use)
export interface AIGenerationRequest {
  elementId: string;
  fieldName: string;
  fieldType: string;
  currentValue?: string;
  context?: string;
  prompt?: string;
}

// SSE Server Request Types (what gets sent to your Python server)
export interface SSEServerRequest {
  elementid: string;
  field: string;
  business_description: string;
  prompt: string;
}

// AI API Response Types (from your AI model)
export interface ExternalAIResponse {
  success: boolean;
  data?: {
    [fieldName: string]: string;
  };
  error?: string;
  message?: string;
}

// Internal API Response Types
export interface AIGenerationResponse {
  success: boolean;
  elementId?: string;
  generatedFields?: Record<string, AIFieldData>;
  error?: string;
  message?: string;
}

export interface ValidationResponse {
  success: boolean;
  message?: string;
  error?: string;
  repaired?: boolean;
  backupCreated?: boolean;
}

// Hook Types
export interface UseAIDataWatcherReturn {
  isWatching: boolean;
  setIsWatching: (watching: boolean) => void;
  triggerCheck: () => void;
  isAIActive: boolean;
}

// Utility Types
export type FieldType = 'text' | 'title' | 'description' | 'email' | 'url';

export interface AIDataHandlerResult {
  success: boolean;
  message?: string;
  repaired?: boolean;
  backupCreated?: boolean;
}
