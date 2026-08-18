import { NextRequest, NextResponse } from 'next/server';
import { TikTokBackendService } from '@/server/services/tiktok.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL video TikTok harus diisi.',
        },
        { status: 400 }
      );
    }

    const result = await TikTokBackendService.scrapeVideo(url);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
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
