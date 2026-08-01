export const NOTICE_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '공지사항을 찾을 수 없음',
    errorExample: '공지사항을 찾을 수 없습니다.',
} as const;

export const NOTICE_ADMIN_STATUS_VALUES = ['published', 'draft', 'archived'] as const;

export const NOTICE_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const NOTICE_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '공지사항을 찾을 수 없음',
    errorExample: '공지사항을 찾을 수 없습니다.',
} as const;
