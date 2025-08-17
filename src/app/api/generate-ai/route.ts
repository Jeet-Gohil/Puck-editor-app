/**
 * AI Generation API Route - Handles AI content generation with external AI API
 */
import { NextRequest, NextResponse } from 'next/server';
import { readAIData, writeAIData, cleanupBackups } from '@/utils/aiDataHandler';
import { aiService } from '@/utils/aiService';
import { FALLBACK_AI_FIELDS } from '@/constants';
import { AIGenerationResponse, AIGenerationRequest } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<AIGenerationResponse>> {
  try {
    const requestData: AIGenerationRequest = await request.json();
    const { elementId, fieldName, fieldType, currentValue, context } = requestData;
    console.log(requestData);

    // Validate required fields
    if (!elementId) {
      return NextResponse.json(
        { success: false, error: 'Element ID is required' },
        { status: 400 }
      );
    }

    if (!fieldName) {
      return NextResponse.json(
        { success: false, error: 'Field name is required' },
        { status: 400 }
      );
    }

    if (!fieldType) {
      return NextResponse.json(
        { success: false, error: 'Field type is required' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    let generatedContent: string;

    try {
      // Try to generate content using the external AI API
      console.log(`🚀 Starting AI generation for field: ${fieldName} (${fieldType})`);
      console.log(`🎯 Element ID: ${elementId}`);
      console.log(`📝 Current value: ${currentValue}`);
    console.log(`🚀 AI generation started - will trigger active polling`);

      generatedContent = await aiService.generateFieldContent({
        elementId,
        fieldName,
        fieldType,
        currentValue,
        context,
      });

      console.log(`✅ AI content generated successfully for ${fieldName}:`, generatedContent);

      if (!generatedContent || generatedContent.trim() === '') {
        throw new Error('Empty content received from AI service');
      }

    } catch (aiError) {
      console.error('❌ AI service failed, using fallback content:', aiError);

      // Fallback to default content if AI service fails
      const fallbackField = FALLBACK_AI_FIELDS[fieldName as keyof typeof FALLBACK_AI_FIELDS];
      generatedContent = fallbackField?.value || `Generated ${fieldType} content`;

      console.log(`🔄 Using fallback content: ${generatedContent}`);
    }

    // Create the generated field data structure
    const generatedFieldData = {
      value: generatedContent,
      timestamp,
      generated: true,
      fieldType,
    };

    // Read existing data and update
    const data = readAIData();

    // Initialize element data if it doesn't exist
    if (!data[elementId]) {
      data[elementId] = {};
    }

    // Update the specific field
    data[elementId][fieldName] = generatedFieldData;

    const writeSuccess = writeAIData(data);

    if (!writeSuccess) {
      throw new Error('Failed to save AI data');
    }

    console.log(`💾 AI data saved successfully for ${elementId}.${fieldName}`);

    // Cleanup old backups periodically (10% chance)
    if (Math.random() < 0.1) {
      cleanupBackups();
    }

    const response = {
      success: true,
      elementId,
      generatedFields: {
        [fieldName]: generatedFieldData,
      },
    };

    console.log(`📤 Sending response:`, response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in AI generation API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
