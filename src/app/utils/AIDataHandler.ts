// utils/aiDataHandler.ts
import fs from 'fs';
import path from 'path';

const AI_DATA_FILE = path.join(process.cwd(), 'data', 'ai-generated-content.json');

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

export const ensureDataDirectory = (): void => {
  const dataDir = path.dirname(AI_DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

export const readAIData = (): AIData => {
  try {
    if (fs.existsSync(AI_DATA_FILE)) {
      const data = fs.readFileSync(AI_DATA_FILE, 'utf8');

      // Check if file is empty or contains only whitespace
      if (!data.trim()) {
        console.warn('AI data file is empty, returning empty object');
        return {};
      }

      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error('JSON parse error in AI data file:', parseError);
        console.error('File content:', data);

        // Try to recover by creating a backup and returning empty object
        const backupFile = AI_DATA_FILE + '.backup.' + Date.now();
        fs.writeFileSync(backupFile, data);
        console.log(`Corrupted file backed up to: ${backupFile}`);

        return {};
      }
    }
    return {};
  } catch (error) {
    console.error('Error reading AI data:', error);
    return {};
  }
};

export const writeAIData = (data: AIData): boolean => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(AI_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing AI data:', error);
    return false;
  }
};

export const updateAIField = (
  elementId: string,
  fieldName: string,
  value: string,
  fieldType: string = 'text'
): boolean => {
  const existingData = readAIData();

  if (!existingData[elementId]) {
    existingData[elementId] = {};
  }

  existingData[elementId][fieldName] = {
    value,
    timestamp: new Date().toISOString(),
    generated: true,
    fieldType
  };

  return writeAIData(existingData);
};

export const validateAndRepairAIData = (): { isValid: boolean; repaired: boolean; errors: string[] } => {
  const errors: string[] = [];
  let repaired = false;

  try {
    if (!fs.existsSync(AI_DATA_FILE)) {
      return { isValid: true, repaired: false, errors: [] };
    }

    const data = fs.readFileSync(AI_DATA_FILE, 'utf8');

    if (!data.trim()) {
      // Empty file - write empty object
      writeAIData({});
      return { isValid: true, repaired: true, errors: ['File was empty, initialized with empty object'] };
    }

    try {
      const parsed = JSON.parse(data);

      // Validate structure
      let hasInvalidEntries = false;
      const cleanedData: AIData = {};

      for (const [elementId, fields] of Object.entries(parsed)) {
        if (typeof fields !== 'object' || fields === null) {
          errors.push(`Invalid entry for element ${elementId}: not an object`);
          hasInvalidEntries = true;
          continue;
        }

        cleanedData[elementId] = {};

        for (const [fieldName, fieldData] of Object.entries(fields as any)) {
          if (typeof fieldData !== 'object' || fieldData === null) {
            errors.push(`Invalid field data for ${elementId}.${fieldName}: not an object`);
            hasInvalidEntries = true;
            continue;
          }

          const fd = fieldData as any;
          if (typeof fd.value !== 'string' || typeof fd.timestamp !== 'string' || typeof fd.generated !== 'boolean') {
            errors.push(`Invalid field structure for ${elementId}.${fieldName}`);
            hasInvalidEntries = true;
            continue;
          }

          cleanedData[elementId][fieldName] = {
            value: fd.value,
            timestamp: fd.timestamp,
            generated: fd.generated,
            fieldType: fd.fieldType || 'text'
          };
        }
      }

      if (hasInvalidEntries) {
        writeAIData(cleanedData);
        repaired = true;
      }

      return { isValid: !hasInvalidEntries, repaired, errors };

    } catch (parseError) {
      errors.push(`JSON parse error: ${parseError}`);

      // Try to repair by creating backup and empty file
      const backupFile = AI_DATA_FILE + '.backup.' + Date.now();
      fs.writeFileSync(backupFile, data);
      writeAIData({});

      return {
        isValid: false,
        repaired: true,
        errors: [...errors, `Corrupted file backed up to ${backupFile}`, 'Initialized with empty object']
      };
    }

  } catch (error) {
    errors.push(`File system error: ${error}`);
    return { isValid: false, repaired: false, errors };
  }
};
