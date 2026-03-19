import { NextResponse } from 'next/server';
import { APP_VERSION_INFO } from '@/lib/version.generated';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(APP_VERSION_INFO);
}