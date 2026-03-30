import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import {
  rulesForKind,
  uploadMediaToCloudinary,
  type MediaUploadKind
} from '@/lib/media/cloudinary.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedContentType(actual: string, allowed: string[]) {
  const value = String(actual || '').trim().toLowerCase();
  if (!value) return false;

  return allowed.some((rule) => {
    const normalized = String(rule || '').trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.endsWith('/*')) {
      return value.startsWith(normalized.slice(0, -1));
    }
    return value === normalized;
  });
}

export async function POST(request: Request) {
  try {
    if (String(process.env.MEDIA_DRIVER || '').trim() !== 'cloudinary') {
      return NextResponse.json(
        { error: 'MEDIA_DRIVER is not cloudinary' },
        { status: 500 }
      );
    }

    const session = await getSession();
    if (!session?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const kindRaw = String(formData.get('kind') || '').trim() as MediaUploadKind;
    const fileValue = formData.get('file');

    if (!kindRaw) {
      return NextResponse.json({ error: 'kind is required' }, { status: 400 });
    }

    if (!fileValue || typeof fileValue !== 'object' || !('arrayBuffer' in fileValue)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const file = fileValue as File;
    const rules = rulesForKind(kindRaw);

    if (!isAllowedContentType(file.type || '', rules.allowedContentTypes)) {
      return NextResponse.json(
        { error: `Unsupported content type: ${file.type || 'unknown'}` },
        { status: 400 }
      );
    }

    if ((file.size || 0) > rules.maximumSizeInBytes) {
      return NextResponse.json(
        { error: `File is too large. Max ${rules.maximumSizeInBytes} bytes` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadMediaToCloudinary({
      uid: session.uid,
      kind: kindRaw,
      fileName: file.name || 'file',
      contentType: file.type || '',
      buffer
    });

    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      publicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
      bytes: uploaded.bytes,
      format: uploaded.format
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    );
  }
}