/**
 * AI Data Validation API Route - Handles validation and repair of AI data
 */
import { NextResponse } from 'next/server';
import { validateAndRepairAIData } from '@/utils/aiDataHandler';

export async function POST(): Promise<NextResponse> {
  try {
    const result = validateAndRepairAIData();
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error validating AI data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to validate AI data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
