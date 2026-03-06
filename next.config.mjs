import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const version = pkg?.version ?? '0.0.0';
const gitSha = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7);
const buildTime = new Date().toISOString();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Exposed to the client bundle (safe): used for displaying build info.
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_GIT_SHA: gitSha,
    NEXT_PUBLIC_BUILD_TIME: buildTime
  }
};

export default nextConfig;
