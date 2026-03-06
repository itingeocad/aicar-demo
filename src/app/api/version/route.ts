import { NextResponse } from 'next/server';
import { APP_NAME, APP_VERSION, GIT_SHA, BUILD_TIME } from '@/lib/version';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    name: APP_NAME,
    version: APP_VERSION,
    gitSha: GIT_SHA,
    buildTime: BUILD_TIME
  });
}
