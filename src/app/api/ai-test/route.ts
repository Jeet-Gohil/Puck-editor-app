/**
 * AI Test API Route - Tests connection to external AI API
 */
import { NextResponse } from 'next/server';
import { aiService } from '@/utils/aiService';

export async function GET() {
  try {
    console.log('Testing AI API connection...');
    
    const isConnected = await aiService.testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'AI API connection successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'AI API connection failed',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('AI API test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'AI API test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('Testing AI content generation...');
    
    const testContent = await aiService.generateFieldContent({
      elementId: 'test',
      fieldName: 'title',
      fieldType: 'title',
      currentValue: '',
      context: 'This is a test request',
    });
    
    return NextResponse.json({
      success: true,
      message: 'AI content generation test successful',
      generatedContent: testContent,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('AI content generation test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'AI content generation test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
