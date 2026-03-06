import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

function arg(name, def = '') {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return def;
  const v = process.argv[idx + 1];
  return v ?? def;
}

function requireEnv(key) {
  const v = process.env[key];
  if (!v) {
    console.error(`Missing env: ${key}`);
    process.exit(1);
  }
  return v;
}

const email = (arg('--email') || '').trim().toLowerCase();
const password = arg('--password') || '';
const name = arg('--name') || 'Super Admin';

if (!email || !password) {
  console.error('Usage: node scripts/bootstrap-superadmin.mjs --email <email> --password <password> [--name <display name>]');
  process.exit(1);
}

const url = requireEnv('UPSTASH_REDIS_REST_URL');
const token = requireEnv('UPSTASH_REDIS_REST_TOKEN');

const rolesKey = process.env.AICAR_AUTH_ROLES_KEY || 'aicar:auth:roles';
const usersKey = process.env.AICAR_AUTH_USERS_KEY || 'aicar:auth:users';

const redis = new Redis({ url, token });

const SYSTEM_ROLE = {
  id: 'super_admin',
  name: 'Супер админ',
  description: 'Полный доступ ко всем разделам админки и данным.',
  permissions: ['*'],
  isSystem: true
};

async function main() {
  const rawRoles = await redis.get(rolesKey);
  let roles = [];
  if (typeof rawRoles === 'string') {
    try { roles = JSON.parse(rawRoles); } catch { roles = []; }
  }

  const byId = new Map((roles || []).map((r) => [r.id, r]));
  byId.set(SYSTEM_ROLE.id, SYSTEM_ROLE);
  const nextRoles = Array.from(byId.values());
  await redis.set(rolesKey, JSON.stringify(nextRoles));

  const rawUsers = await redis.get(usersKey);
  let users = [];
  if (typeof rawUsers === 'string') {
    try { users = JSON.parse(rawUsers); } catch { users = []; }
  }

  const now = new Date().toISOString();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const idx = (users || []).findIndex((u) => String(u.email || '').toLowerCase() === email);

  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      displayName: name,
      passwordHash,
      roleIds: ['super_admin'],
      isActive: true,
      updatedAt: now
    };
    console.log(`Updated existing user: ${email}`);
  } else {
    const u = {
      id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `u_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
      email,
      displayName: name,
      passwordHash,
      roleIds: ['super_admin'],
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    users.push(u);
    console.log(`Created user: ${email}`);
  }

  await redis.set(usersKey, JSON.stringify(users));

  console.log('✅ Bootstrap done. You can now log in at /login and open /admin');
  console.log(`Roles key: ${rolesKey}`);
  console.log(`Users key: ${usersKey}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
