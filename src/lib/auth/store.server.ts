import { getRedis } from '@/lib/kv/upstash.server';
import { SYSTEM_ROLES } from './constants';
import type { RoleDoc, UserDoc } from './types';

function rolesKey() {
  return process.env.AICAR_AUTH_ROLES_KEY || 'aicar:auth:roles';
}

function usersKey() {
  return process.env.AICAR_AUTH_USERS_KEY || 'aicar:auth:users';
}

export async function getRoles(): Promise<RoleDoc[]> {
  const redis = getRedis();
  if (!redis) return [...SYSTEM_ROLES];
  const raw = await redis.get<string>(rolesKey());
  if (!raw) return [...SYSTEM_ROLES];
  try {
    const parsed = JSON.parse(raw) as RoleDoc[];
    // Ensure system roles always exist.
    const byId = new Map(parsed.map((r) => [r.id, r]));
    for (const sys of SYSTEM_ROLES) {
      if (!byId.has(sys.id)) byId.set(sys.id, sys);
    }
    return Array.from(byId.values());
  } catch {
    return [...SYSTEM_ROLES];
  }
}

export async function saveRoles(roles: RoleDoc[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  // Always keep system roles.
  const byId = new Map(roles.map((r) => [r.id, r]));
  for (const sys of SYSTEM_ROLES) byId.set(sys.id, sys);
  await redis.set(rolesKey(), JSON.stringify(Array.from(byId.values())));
}

export async function getUsers(): Promise<UserDoc[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.get<string>(usersKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserDoc[];
  } catch {
    return [];
  }
}

export async function saveUsers(users: UserDoc[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(usersKey(), JSON.stringify(users));
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const users = await getUsers();
  const norm = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === norm) ?? null;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function rolePermissions(roleIds: string[]): Promise<string[]> {
  const roles = await getRoles();
  const map = new Map(roles.map((r) => [r.id, r]));
  const perms = new Set<string>();
  for (const rid of roleIds) {
    const r = map.get(rid);
    if (!r) continue;
    for (const p of r.permissions) perms.add(p);
  }
  return Array.from(perms);
}
