import { NextResponse } from 'next/server';
import { cloudinaryDebug } from '@/lib/media/cloudinary.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    media: cloudinaryDebug()
  });
}