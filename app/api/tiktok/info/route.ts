import { NextRequest, NextResponse } from 'next/server';
import { TikTokBackendService } from '@/server/services/tiktok.service';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const result = await TikTokBackendService.scrapeVideo(url);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/tiktok/info] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Gagal mengekstrak video TikTok.',
      },
      { status: 500 }
    );
  }
}
