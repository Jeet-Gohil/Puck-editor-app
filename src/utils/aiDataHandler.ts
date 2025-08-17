/**
 * AI Data Handler - Manages AI-generated content storage and retrieval
 * Optimized version with better error handling and type safety
 */
import fs from 'fs';
import path from 'path';
import { AIData, AIDataHandlerResult } from '@/types';
import { FILE_PATHS } from '@/constants';

const AI_DATA_FILE = path.join(process.cwd(), FILE_PATHS.AI_DATA);

/**
 * Ensures the data directory exists
 */
export const ensureDataDirectory = (): void => {
  const dataDir = path.dirname(AI_DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

/**
 * Creates a backup of the current AI data file
 */
const createBackup = (): string => {
  const timestamp = Date.now();
  const backupPath = `${AI_DATA_FILE}.backup.${timestamp}`;
  
  if (fs.existsSync(AI_DATA_FILE)) {
    fs.copyFileSync(AI_DATA_FILE, backupPath);
  }
  
  return backupPath;
};

/**
 * Reads AI data from the JSON file with error handling
 */
export const readAIData = (): AIData => {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(AI_DATA_FILE)) {
      return {};
    }

    const data = fs.readFileSync(AI_DATA_FILE, 'utf8');
    
    if (!data.trim()) {
      return {};
    }

    const parsed = JSON.parse(data);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
    
  } catch (error) {
    console.error('Error reading AI data:', error);
    
    // Create backup of corrupted file
    if (fs.existsSync(AI_DATA_FILE)) {
      createBackup();
    }
    
    return {};
  }
};

/**
 * Writes AI data to the JSON file with error handling
 */
export const writeAIData = (data: AIData): boolean => {
  try {
    ensureDataDirectory();
    
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(AI_DATA_FILE, jsonString, 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error writing AI data:', error);
    return false;
  }
};

/**
 * Validates and repairs AI data structure
 */
export const validateAndRepairAIData = (): AIDataHandlerResult => {
  try {
    let repaired = false;
    let backupCreated = false;
    
    if (!fs.existsSync(AI_DATA_FILE)) {
      writeAIData({});
      return {
        success: true,
        message: 'AI data file created',
        repaired: true,
      };
    }

    const rawData = fs.readFileSync(AI_DATA_FILE, 'utf8');
    
    if (!rawData.trim()) {
      writeAIData({});
      return {
        success: true,
        message: 'Empty file repaired',
        repaired: true,
      };
    }

    try {
      const parsed = JSON.parse(rawData);
      
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure');
      }

      // Validate structure and clean invalid entries
      const cleanedData: AIData = {};
      let hasInvalidEntries = false;

      for (const [elementId, fields] of Object.entries(parsed)) {
        if (typeof fields === 'object' && fields !== null) {
          cleanedData[elementId] = {};
          
          for (const [fieldName, fieldData] of Object.entries(fields as Record<string, any>)) {
            if (
              typeof fieldData === 'object' &&
              fieldData !== null &&
              typeof fieldData.value === 'string' &&
              typeof fieldData.timestamp === 'string' &&
              typeof fieldData.generated === 'boolean' &&
              typeof fieldData.fieldType === 'string'
            ) {
              cleanedData[elementId][fieldName] = fieldData;
            } else {
              hasInvalidEntries = true;
            }
          }
        } else {
          hasInvalidEntries = true;
        }
      }

      if (hasInvalidEntries) {
        backupCreated = true;
        createBackup();
        writeAIData(cleanedData);
        repaired = true;
      }

      return {
        success: true,
        message: repaired ? 'AI data validated and repaired' : 'AI data is valid',
        repaired,
        backupCreated,
      };

    } catch (parseError) {
      // JSON is corrupted, create backup and reset
      backupCreated = true;
      createBackup();
      writeAIData({});
      
      return {
        success: true,
        message: 'Corrupted AI data file repaired',
        repaired: true,
        backupCreated,
      };
    }

  } catch (error) {
    console.error('Error validating AI data:', error);
    return {
      success: false,
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Cleans up old backup files (keeps only the 5 most recent)
 */
export const cleanupBackups = (): void => {
  try {
    const dataDir = path.dirname(AI_DATA_FILE);
    const files = fs.readdirSync(dataDir);
    
    const backupFiles = files
      .filter(file => file.startsWith('ai-generated-content.json.backup.'))
      .map(file => ({
        name: file,
        path: path.join(dataDir, file),
        timestamp: parseInt(file.split('.').pop() || '0'),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // Keep only the 5 most recent backups
    const filesToDelete = backupFiles.slice(5);
    
    filesToDelete.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Error deleting backup file ${file.name}:`, error);
      }
    });
    
  } catch (error) {
    console.error('Error cleaning up backups:', error);
  }
};
