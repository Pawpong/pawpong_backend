export const ANNOUNCEMENT_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음 (관리자만 접근 가능)',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const ANNOUNCEMENT_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '공지사항을 찾을 수 없음',
    errorExample: '공지사항을 찾을 수 없습니다.',
} as const;
