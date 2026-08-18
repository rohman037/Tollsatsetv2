import { NextRequest, NextResponse } from 'next/server';
import { ProductEnrichmentService } from '@/server/services/product-enrichment.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL produk valid (http/https) harus disertakan.',
        },
        { status: 400 }
      );
    }

    const enrichment = await ProductEnrichmentService.enrichProductUrl(url.trim());

    if (!enrichment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak dapat mengekstrak informasi produk dari URL tersebut.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: enrichment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/product/resolve] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Gagal memproses metadata produk.',
      },
      { status: 500 }
    );
  }
}
