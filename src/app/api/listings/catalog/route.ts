import { NextResponse } from 'next/server';
import { getListingCatalog } from '@/lib/listings/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    catalog: getListingCatalog()
  });
}