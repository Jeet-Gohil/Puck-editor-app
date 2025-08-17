/**
 * Application constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  AI_DATA: '/api/ai-data',
  GENERATE_AI: '/api/generate-ai',
  VALIDATE_AI_DATA: '/api/ai-data/validate',
} as const;

// File Paths
export const FILE_PATHS = {
  AI_DATA: 'data/ai-generated-content.json',
} as const;

// Polling Intervals
export const POLLING_INTERVALS = {
  AI_DATA_WATCHER: 10000, // 10 seconds (much less frequent)
  AI_DATA_WATCHER_ACTIVE: 3000, // 3 seconds when AI is generating
  AI_DATA_WATCHER_IDLE: 30000, // 30 seconds when idle (very infrequent)
} as const;

// Default Values
export const DEFAULT_VALUES = {
  HERO_SECTION: {
    navbarBrand: 'Your Brand',
    navbarButtonText: 'Login',
    title: 'Your Amazing Title Here',
    description: 'Your description goes here. This is a sample description that you can edit.',
    primaryButtonText: 'Get Started',
    secondaryButtonText: 'Learn More',
    imageSrc: 'https://via.placeholder.com/800x600/4f46e5/ffffff?text=Your+Image',
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 500, // milliseconds
  SUCCESS_MESSAGE_DURATION: 3000, // milliseconds
} as const;

// Field Types
export const FIELD_TYPES = {
  TEXT: 'text',
  TITLE: 'title',
  DESCRIPTION: 'description',
  EMAIL: 'email',
  URL: 'url',
} as const;

// AI SSE Server Configuration
export const AI_CONFIG = {
  // Default configuration - can be overridden by environment variables
  DEFAULT_MODEL: 'your-model-name',
  DEFAULT_MAX_TOKENS: 150,
  DEFAULT_TEMPERATURE: 0.7,
  TIMEOUT: 60000, // 60 seconds for SSE streaming
  SSE_TIMEOUT: 60000, // SSE stream timeout
  DEFAULT_BUSINESS_DESCRIPTION: 'Modern web application', // Default business context
} as const;

// AI Prompts for different field types
export const AI_PROMPTS = {
  title: 'Generate a compelling, concise title for a website or landing page. Make it engaging and professional. Return only the title text, no quotes or extra formatting.',
  description: 'Generate a clear, engaging description for a website or product. Make it informative and compelling, around 1-2 sentences. Return only the description text, no quotes or extra formatting.',
  text: 'Generate appropriate text content for this field. Make it concise and relevant. Return only the text, no quotes or extra formatting.',
  navbarBrand: 'Generate a professional brand name for a company or product. Make it memorable and concise. Return only the brand name, no quotes or extra formatting.',
  navbarButtonText: 'Generate text for a navigation button. Make it action-oriented and concise (1-2 words). Return only the button text, no quotes or extra formatting.',
  primaryButtonText: 'Generate text for a primary call-to-action button. Make it compelling and action-oriented (1-3 words). Return only the button text, no quotes or extra formatting.',
  secondaryButtonText: 'Generate text for a secondary button. Make it supportive and clear (1-3 words). Return only the button text, no quotes or extra formatting.',
} as const;

// Fallback data in case AI API fails
export const FALLBACK_AI_FIELDS = {
  title: { value: 'Your Amazing Title Here', fieldType: 'title' },
  description: { value: 'Your description goes here. This is a sample description that you can edit.', fieldType: 'description' },
  navbarBrand: { value: 'Your Brand', fieldType: 'text' },
  navbarButtonText: { value: 'Login', fieldType: 'text' },
  primaryButtonText: { value: 'Get Started', fieldType: 'text' },
  secondaryButtonText: { value: 'Learn More', fieldType: 'text' },
} as const;
