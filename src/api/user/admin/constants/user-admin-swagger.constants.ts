export const USER_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const USER_ADMIN_SUPER_ADMIN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: 'super_admin 권한이 필요합니다.',
} as const;

export const USER_ADMIN_MANAGED_ROLE_VALUES = ['adopter', 'breeder'] as const;
