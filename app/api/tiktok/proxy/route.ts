import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'media_tiktok.mp4';
    const isDownload = searchParams.get('download') === 'true';

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL query parameter is required' }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: targetUrl.includes('tiktok') ? 'https://www.tiktok.com/' : '',
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch target media: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    };

    if (isDownload || filename) {
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(filename)}"`;
    }

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('[API /api/tiktok/proxy GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproksi media.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = body.url;

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL is required in body' }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: targetUrl.includes('tiktok') ? 'https://www.tiktok.com/' : '',
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch target media: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      contentType,
      size: buffer.byteLength,
    });
  } catch (error: any) {
    console.error('[API /api/tiktok/proxy POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproksi media.' },
      { status: 500 }
    );
  }
}
