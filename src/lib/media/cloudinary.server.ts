import { v2 as cloudinary } from 'cloudinary';

export type MediaUploadKind = 'avatar' | 'cover' | 'clip-poster' | 'clip-video';

let configured = false;

function readEnv(name: string): string {
  return String(process.env[name] || '').trim();
}

function ensureConfigured() {
  if (configured) return;

  const cloudName = readEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = readEnv('CLOUDINARY_API_KEY');
  const apiSecret = readEnv('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  configured = true;
}

function safeSegment(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function baseNameNoExt(fileName: string): string {
  return String(fileName || '').replace(/\.[^.]+$/, '');
}

function folderFor(uid: string, kind: MediaUploadKind): string {
  switch (kind) {
    case 'avatar':
      return `aicar/profiles/${uid}/avatar`;
    case 'cover':
      return `aicar/profiles/${uid}/cover`;
    case 'clip-poster':
      return `aicar/clips/${uid}/posters`;
    case 'clip-video':
    default:
      return `aicar/clips/${uid}/videos`;
  }
}

function resourceTypeFor(kind: MediaUploadKind): 'image' | 'video' {
  return kind === 'clip-video' ? 'video' : 'image';
}

export function rulesForKind(kind: MediaUploadKind) {
  switch (kind) {
    case 'avatar':
    case 'cover':
    case 'clip-poster':
      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 15 * 1024 * 1024
      };
    case 'clip-video':
    default:
      return {
        allowedContentTypes: ['video/*'],
        maximumSizeInBytes: 95 * 1024 * 1024
      };
  }
}

function uploadStream(buffer: Buffer, options: Record<string, unknown>): Promise<any> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options as any, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });

    stream.end(buffer);
  });
}

export async function uploadMediaToCloudinary(args: {
  uid: string;
  kind: MediaUploadKind;
  fileName: string;
  buffer: Buffer;
  contentType?: string;
}) {
  const base = safeSegment(baseNameNoExt(args.fileName)) || 'file';
  const folder = folderFor(args.uid, args.kind);
  const resourceType = resourceTypeFor(args.kind);

  const result = await uploadStream(args.buffer, {
    folder,
    resource_type: resourceType,
    public_id: `${Date.now()}-${base}`,
    overwrite: false,
    invalidate: true
  });

  return {
    url: String(result?.secure_url || result?.url || ''),
    publicId: String(result?.public_id || ''),
    resourceType,
    bytes: Number(result?.bytes || 0),
    format: String(result?.format || '')
  };
}

export function cloudinaryDebug() {
  return {
    driver: String(process.env.MEDIA_DRIVER || '').trim(),
    cloudName: readEnv('CLOUDINARY_CLOUD_NAME'),
    apiKeyPresent: Boolean(readEnv('CLOUDINARY_API_KEY')),
    apiSecretPresent: Boolean(readEnv('CLOUDINARY_API_SECRET')),
    configured:
      Boolean(readEnv('CLOUDINARY_CLOUD_NAME')) &&
      Boolean(readEnv('CLOUDINARY_API_KEY')) &&
      Boolean(readEnv('CLOUDINARY_API_SECRET'))
  };
}