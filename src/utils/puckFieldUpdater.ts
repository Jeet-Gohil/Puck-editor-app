/**
 * Puck Field Updater - Directly updates Puck editor fields in real-time
 */

export interface FieldUpdateData {
  elementId: string;
  fieldName: string;
  value: string;
}

/**
 * Updates a specific field in the Puck editor by finding the input element
 */
export const updatePuckField = (elementId: string, fieldName: string, value: string): boolean => {
  try {
    console.log(`🎯 Attempting to update field ${fieldName} for element ${elementId}`);
    console.log(`📝 New value:`, value);

    // Find the field input element in the Puck editor
    // Puck editor creates input elements with specific patterns
    const possibleSelectors = [
      // Most specific first - exact Puck patterns
      `input[name="props.${fieldName}"]`,
      `textarea[name="props.${fieldName}"]`,
      `input[id="props.${fieldName}"]`,
      `textarea[id="props.${fieldName}"]`,

      // Direct field name matching
      `input[name="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `input[id="${fieldName}"]`,
      `textarea[id="${fieldName}"]`,

      // Contains field name (but be careful with order)
      `input[name*="props"][name*="${fieldName}"]`,
      `textarea[name*="props"][name*="${fieldName}"]`,

      // Data attributes
      `input[data-field="${fieldName}"]`,
      `textarea[data-field="${fieldName}"]`,

      // Element ID context
      `[data-element-id="${elementId}"] input`,
      `[data-element-id="${elementId}"] textarea`,

      // Broader patterns (only if specific ones fail)
      `input[name*="${fieldName}"]`,
      `textarea[name*="${fieldName}"]`,
      `input[id*="${fieldName}"]`,
      `textarea[id*="${fieldName}"]`,
    ];

    let fieldElement: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Try each selector until we find the field
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;

      if (elements.length > 0) {
        console.log(`🔍 Found ${elements.length} elements with selector: ${selector}`);

        // If multiple elements found, try to find the one that matches our field exactly
        for (const element of elements) {
          const elementName = element.name || element.id || '';
          const elementValue = element.value || '';

          console.log(`  - Element: name="${elementName}", id="${element.id}", value="${elementValue}"`);

          // Check if this element matches our specific field
          const isExactMatch = (
            elementName === `props.${fieldName}` ||
            elementName === fieldName ||
            element.id === `props.${fieldName}` ||
            element.id === fieldName
          );

          // Check if this element is in the context of our component
          const parentElement = element.closest('[data-rbd-draggable-id]');
          const isInCorrectComponent = parentElement &&
            parentElement.getAttribute('data-rbd-draggable-id')?.includes(elementId.split('-')[0]);

          if (isExactMatch) {
            fieldElement = element;
            console.log(`✅ Found exact field match: ${elementName}`);
            break;
          } else if (isInCorrectComponent && elementName.includes(fieldName)) {
            fieldElement = element;
            console.log(`✅ Found field in correct component: ${elementName}`);
            break;
          }
        }

        // If we found a field element, stop searching
        if (fieldElement) {
          console.log(`✅ Selected field element: name="${fieldElement.name}", id="${fieldElement.id}"`);
          break;
        }
      }
    }

    if (!fieldElement) {
      console.warn(`❌ Could not find field element for ${fieldName}`);

      // Debug: Log all available input/textarea elements
      const allInputs = document.querySelectorAll('input, textarea');
      console.log(`🔍 Available input/textarea elements (${allInputs.length}):`);
      allInputs.forEach((input, index) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
        console.log(`  ${index + 1}. ${element.tagName} - name: "${element.name}" - id: "${element.id}" - value: "${element.value}"`);
      });

      return false;
    }

    // Update the field value
    const oldValue = fieldElement.value;
    fieldElement.value = value;

    console.log(`📝 Updated field ${fieldName}:`, { oldValue, newValue: value });

    // Trigger change events to notify React/Puck
    const events = [
      new Event('input', { bubbles: true }),
      new Event('change', { bubbles: true }),
      new Event('blur', { bubbles: true }),
    ];

    events.forEach(event => {
      fieldElement!.dispatchEvent(event);
    });

    // Add visual feedback
    addVisualFeedback(fieldElement);

    console.log(`✅ Successfully updated field ${fieldName} for element ${elementId}`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating field ${fieldName}:`, error);
    return false;
  }
};

/**
 * Adds visual feedback to show the field was updated
 */
const addVisualFeedback = (element: HTMLElement): void => {
  try {
    // Add a temporary class for visual feedback
    element.classList.add('ai-updated');
    
    // Apply temporary styles
    const originalBorder = element.style.border;
    const originalBackground = element.style.backgroundColor;
    
    element.style.border = '2px solid #10b981';
    element.style.backgroundColor = '#ecfdf5';
    element.style.transition = 'all 0.3s ease';

    // Remove the visual feedback after a delay
    setTimeout(() => {
      element.style.border = originalBorder;
      element.style.backgroundColor = originalBackground;
      element.classList.remove('ai-updated');
    }, 2000);

  } catch (error) {
    console.error('Error adding visual feedback:', error);
  }
};

/**
 * Finds all field elements in the current Puck editor
 */
export const findAllPuckFields = (): Array<{ element: HTMLElement; name: string }> => {
  const fields: Array<{ element: HTMLElement; name: string }> = [];
  
  try {
    const inputs = document.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;
    
    inputs.forEach(input => {
      const name = input.name || input.id || 'unknown';
      if (name !== 'unknown') {
        fields.push({ element: input, name });
      }
    });

    console.log(`🔍 Found ${fields.length} field elements in Puck editor`);
    return fields;

  } catch (error) {
    console.error('Error finding Puck fields:', error);
    return [];
  }
};

/**
 * Debug function to log all available fields
 */
export const debugPuckFields = (): void => {
  console.log('🔍 Debugging Puck fields...');
  const fields = findAllPuckFields();
  
  fields.forEach((field, index) => {
    console.log(`Field ${index + 1}:`, {
      name: field.name,
      value: (field.element as HTMLInputElement).value,
      type: field.element.tagName.toLowerCase(),
      element: field.element,
    });
  });
};
