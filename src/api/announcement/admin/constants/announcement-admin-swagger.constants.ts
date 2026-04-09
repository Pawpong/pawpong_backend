export const ANNOUNCEMENT_ADMIN_ERROR_RESPONSES = [
    { status: 400, description: '잘못된 요청' },
    { status: 401, description: '인증 실패' },
    { status: 403, description: '권한 없음 (관리자만 접근 가능)' },
] as const;
