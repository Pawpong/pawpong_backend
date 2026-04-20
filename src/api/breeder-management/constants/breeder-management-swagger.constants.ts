export const BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
} as const;

export const BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '브리더 권한이 필요합니다.',
} as const;

export const BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
} as const;
