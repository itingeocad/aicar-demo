export const APP_NAME = 'AICar';

// Version is injected at build-time from package.json (see next.config.mjs)
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';

// Short git SHA if available (Vercel provides VERCEL_GIT_COMMIT_SHA)
export const GIT_SHA = (process.env.NEXT_PUBLIC_GIT_SHA ?? '').slice(0, 7);

export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? '';

export function formatBuildLabel() {
  const v = APP_VERSION ? `v${APP_VERSION}` : 'v0.0.0';
  const sha = GIT_SHA ? ` (${GIT_SHA})` : '';
  return `${v}${sha}`;
}
