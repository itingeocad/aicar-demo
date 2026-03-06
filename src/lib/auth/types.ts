export type Permission = string;

export type RoleId = string;

export interface RoleDoc {
  id: RoleId; // slug-like id, e.g. "super_admin"
  name: string;
  description?: string;
  permissions: Permission[]; // e.g. ["admin:access", "site:write"] or ["*"]
  isSystem?: boolean;
}

export interface UserDoc {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  roleIds: RoleId[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPayload {
  uid: string;
  email: string;
  displayName: string;
  roleIds: RoleId[];
  permissions: Permission[];
  iat: number;
  exp: number;
}
