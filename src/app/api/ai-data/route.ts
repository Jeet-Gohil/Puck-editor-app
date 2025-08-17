/**
 * AI Data API Route - Handles reading AI-generated content
 */
import { NextResponse } from 'next/server';
import { readAIData } from '@/utils/aiDataHandler';
import { AIData } from '@/types';

export async function GET(): Promise<NextResponse<AIData | { message: string }>> {
  try {
    const data = readAIData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading AI data:', error);
    return NextResponse.json(
      { message: 'Failed to read AI data' },
      { status: 500 }
    );
  }
}
