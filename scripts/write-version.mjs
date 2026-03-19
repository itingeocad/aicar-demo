import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const outPath = path.join(root, 'src', 'lib', 'version.generated.ts');

function safe(cmd, fallback = '') {
  try {
    return String(execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })).trim();
  } catch {
    return fallback;
  }
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const name = 'AICar';
const version = pkg.version || '0.0.0';
const gitSha = String(process.env.VERCEL_GIT_COMMIT_SHA || safe('git rev-parse --short HEAD', '')).trim().slice(0, 7);
const gitMessage = String(process.env.VERCEL_GIT_COMMIT_MESSAGE || safe('git log -1 --pretty=%s', '')).trim();
const buildTime = new Date().toISOString();

const file = `export const APP_VERSION_INFO = {
  name: ${JSON.stringify(name)},
  version: ${JSON.stringify(version)},
  gitSha: ${JSON.stringify(gitSha)},
  gitMessage: ${JSON.stringify(gitMessage)},
  buildTime: ${JSON.stringify(buildTime)}
} as const;
`;

fs.writeFileSync(outPath, file, 'utf8');
console.log('Wrote', outPath);