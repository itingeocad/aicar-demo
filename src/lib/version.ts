import { APP_VERSION_INFO } from './version.generated';

export const APP_NAME = APP_VERSION_INFO.name || 'AICar';
export const APP_VERSION = APP_VERSION_INFO.version || '0.0.0';
export const GIT_SHA = (APP_VERSION_INFO.gitSha || '').slice(0, 7);
export const BUILD_TIME = APP_VERSION_INFO.buildTime || '';
export const GIT_MESSAGE = APP_VERSION_INFO.gitMessage || '';

export function formatBuildLabel() {
  const v = APP_VERSION ? `v${APP_VERSION}` : 'v0.0.0';
  const sha = GIT_SHA ? ` (${GIT_SHA})` : '';
  return `${v}${sha}`;
}