/**
 * Test API Route - Simple health check
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      'ai-data': '/api/ai-data',
      'generate-ai': '/api/generate-ai',
      'test': '/api/test'
    }
  });
}
