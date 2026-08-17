import { NextRequest, NextResponse } from 'next/server';
import { GeminiBackendService } from '@/server/services/gemini.service';
import { GenerateAiRequest } from '@/server/types/api.types';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateAiRequest = await req.json();
    const result = await GeminiBackendService.processAiTask(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/gemini/generate] Unexpected Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan pada backend server.',
      },
      { status: 500 }
    );
  }
}
