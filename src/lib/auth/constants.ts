import type { RoleDoc } from './types';

export const SESSION_COOKIE = 'aicar_session';

export const PERM_ALL = '*';
export const PERM_ADMIN_ACCESS = 'admin:access';

export const ROLE_SUPER_ADMIN = 'super_admin';
export const ROLE_USER = 'user';

export const SYSTEM_ROLES: RoleDoc[] = [
  {
    id: ROLE_SUPER_ADMIN,
    name: 'Супер админ',
    description: 'Полный доступ ко всем разделам админки и данным.',
    permissions: [PERM_ALL],
    isSystem: true
  },
  {
    id: ROLE_USER,
    name: 'Пользователь',
    description: 'Авторизованный пользователь без доступа к админке.',
    permissions: [],
    isSystem: true
  }
];