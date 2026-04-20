export const NOTIFICATION_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '알림을 찾을 수 없음',
    errorExample: '알림을 찾을 수 없습니다.',
} as const;

export const NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;
