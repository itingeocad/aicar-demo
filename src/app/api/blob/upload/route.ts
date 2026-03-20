import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { verifySession } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

type UploadKind = 'avatar' | 'cover' | 'clip-poster' | 'clip-video';

function parsePayload(raw: string | null | undefined): { kind?: UploadKind; token?: string } {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return {
      kind: parsed?.kind,
      token: parsed?.token
    };
  } catch {
    return {};
  }
}

async function resolveSession(rawPayload: string | null | undefined) {
  const direct = await getSession();
  if (direct?.uid) return direct;

  const parsed = parsePayload(rawPayload);
  if (!parsed.token) return null;

  const session = await verifySession(parsed.token);
  if (!session?.uid) return null;

  return session;
}

function rulesForKind(kind: UploadKind) {
  switch (kind) {
    case 'avatar':
    case 'cover':
    case 'clip-poster':
      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 15 * 1024 * 1024
      };
    case 'clip-video':
      return {
        allowedContentTypes: ['video/*'],
        maximumSizeInBytes: 500 * 1024 * 1024
      };
    default:
      return {
        allowedContentTypes: ['video/*'],
        maximumSizeInBytes: 500 * 1024 * 1024
      };
  }
}

function expectedPrefixFor(uid: string, kind: UploadKind) {
  switch (kind) {
    case 'avatar':
    case 'cover':
      return `profiles/${uid}/`;
    case 'clip-poster':
    case 'clip-video':
      return `clips/${uid}/`;
    default:
      return `clips/${uid}/`;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const blobToken = String(process.env.BLOB_READ_WRITE_TOKEN || '').trim();

  if (!blobToken) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is missing in Vercel environment variables' },
      { status: 500 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      token: blobToken,
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await resolveSession(clientPayload);
        if (!session?.uid) {
          throw new Error('Unauthorized');
        }

        const parsed = parsePayload(clientPayload);
        const kind = parsed.kind || 'clip-video';
        const rules = rulesForKind(kind);
        const pathnameText = String(pathname || '');

        if (!pathnameText.startsWith(expectedPrefixFor(session.uid, kind))) {
          throw new Error('Invalid upload path');
        }

        return {
          allowedContentTypes: rules.allowedContentTypes,
          maximumSizeInBytes: rules.maximumSizeInBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            uid: session.uid,
            kind
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('blob upload completed', blob.pathname, tokenPayload);
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    );
  }
}