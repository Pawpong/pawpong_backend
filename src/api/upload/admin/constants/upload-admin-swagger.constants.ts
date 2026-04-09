export const UPLOAD_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const UPLOAD_ADMIN_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
} as const;
