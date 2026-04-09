export const INQUIRY_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '해당 문의에 접근할 권한이 없습니다.',
} as const;

export const INQUIRY_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '문의를 찾을 수 없음',
    errorExample: '문의를 찾을 수 없습니다.',
} as const;
