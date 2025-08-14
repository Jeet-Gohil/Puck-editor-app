// app/api/ai-data/route.ts
import { NextResponse } from 'next/server';
import { AIData, readAIData } from '@/app/utils/AIDataHandler';

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
