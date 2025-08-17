/**
 * Puck Data Updater - Directly updates Puck editor data and preview
 */
import { Data } from '@measured/puck';

// Global reference to the Puck editor's data setter
let globalPuckDataSetter: ((data: Data | ((prevData: Data) => Data)) => void) | null = null;

/**
 * Registers the Puck editor's data setter for global access
 */
export const registerPuckDataSetter = (setter: (data: Data | ((prevData: Data) => Data)) => void): void => {
  globalPuckDataSetter = setter;
  console.log('🎯 Puck data setter registered for real-time updates');
};

/**
 * Unregisters the Puck editor's data setter
 */
export const unregisterPuckDataSetter = (): void => {
  globalPuckDataSetter = null;
  console.log('🎯 Puck data setter unregistered');
};

/**
 * Updates a specific field in the Puck editor's data structure
 */
export const updatePuckData = (elementId: string, fieldName: string, value: string): boolean => {
  if (!globalPuckDataSetter) {
    console.warn('❌ Puck data setter not registered. Cannot update Puck data.');
    return false;
  }

  try {
    console.log(`🎯 Updating Puck data for ${elementId}.${fieldName} with value:`, value);

    globalPuckDataSetter((prevData: Data) => {
      const newData = { ...prevData };
      
      // Find the component in the content array
      const componentIndex = newData.content.findIndex(item => {
        // Extract the base element ID (without _custom_fieldName suffix)
        const baseElementId = elementId.split('_custom_')[0];

        // Check multiple ways to match the component
        return item.props?.id === elementId ||
               item.props?.id === baseElementId ||
               JSON.stringify(item).includes(elementId) ||
               JSON.stringify(item).includes(baseElementId) ||
               item.props?.elementId === elementId ||
               item.props?.elementId === baseElementId ||
               // Check if the item type matches the element type
               (elementId.includes(item.type) && item.type === 'HeroSectionOne');
      });

      if (componentIndex !== -1) {
        // Update the specific field in the component's props
        newData.content[componentIndex] = {
          ...newData.content[componentIndex],
          props: {
            ...newData.content[componentIndex].props,
            [fieldName]: value,
          },
        };

        console.log(`✅ Updated Puck data for component at index ${componentIndex}`);
        console.log(`📝 Updated field ${fieldName} to:`, value);
        
        return newData;
      } else {
        console.warn(`❌ Component with ID ${elementId} not found in Puck data`);

        // Debug: Log all available components with more detail
        console.log('🔍 Available components:', newData.content.map((item, index) => ({
          index,
          type: item.type,
          props: item.props,
          propsKeys: Object.keys(item.props || {}),
          hasId: !!item.props?.id,
          hasElementId: !!item.props?.elementId,
        })));

        // Debug: Show what we're looking for
        const baseElementId = elementId.split('_custom_')[0];
        console.log('🎯 Looking for:', {
          fullElementId: elementId,
          baseElementId: baseElementId,
          fieldName: fieldName,
        });

        return prevData;
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Error updating Puck data:', error);
    return false;
  }
};

/**
 * Updates multiple fields in a component at once
 */
export const updatePuckDataMultiple = (elementId: string, fields: Record<string, string>): boolean => {
  if (!globalPuckDataSetter) {
    console.warn('❌ Puck data setter not registered. Cannot update Puck data.');
    return false;
  }

  try {
    console.log(`🎯 Updating multiple Puck data fields for ${elementId}:`, fields);

    globalPuckDataSetter((prevData: Data) => {
      const newData = { ...prevData };
      
      // Find the component in the content array
      const componentIndex = newData.content.findIndex(item => {
        return item.props?.id === elementId || 
               JSON.stringify(item).includes(elementId) ||
               item.props?.elementId === elementId;
      });

      if (componentIndex !== -1) {
        // Update multiple fields in the component's props
        newData.content[componentIndex] = {
          ...newData.content[componentIndex],
          props: {
            ...newData.content[componentIndex].props,
            ...fields,
          },
        };

        console.log(`✅ Updated multiple Puck data fields for component at index ${componentIndex}`);
        console.log(`📝 Updated fields:`, fields);
        
        return newData;
      } else {
        console.warn(`❌ Component with ID ${elementId} not found in Puck data`);
        return prevData;
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Error updating multiple Puck data fields:', error);
    return false;
  }
};

/**
 * Debug function to log current Puck data structure
 */
export const debugPuckData = (): void => {
  if (!globalPuckDataSetter) {
    console.warn('❌ Puck data setter not registered. Cannot debug Puck data.');
    return;
  }

  // Use a temporary setter to read current data
  globalPuckDataSetter((prevData: Data) => {
    console.log('🔍 Current Puck Data Structure:');
    console.log('📊 Root data:', prevData.root);
    console.log('📋 Content items:', prevData.content.length);
    
    prevData.content.forEach((item, index) => {
      console.log(`📦 Component ${index}:`, {
        type: item.type,
        props: item.props,
      });
    });
    
    return prevData; // Return unchanged data
  });
};

/**
 * Finds a component by element ID and returns its current data
 */
export const findPuckComponent = (elementId: string): any | null => {
  if (!globalPuckDataSetter) {
    console.warn('❌ Puck data setter not registered. Cannot find component.');
    return null;
  }

  let foundComponent: any = null;

  globalPuckDataSetter((prevData: Data) => {
    const component = prevData.content.find(item => {
      return item.props?.id === elementId || 
             JSON.stringify(item).includes(elementId) ||
             item.props?.elementId === elementId;
    });

    if (component) {
      foundComponent = component;
      console.log(`✅ Found component with ID ${elementId}:`, component);
    } else {
      console.warn(`❌ Component with ID ${elementId} not found`);
    }

    return prevData; // Return unchanged data
  });

  return foundComponent;
};
