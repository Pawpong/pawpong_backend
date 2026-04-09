export const BREEDER_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const BREEDER_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '브리더를 찾을 수 없음',
    errorExample: '브리더를 찾을 수 없습니다.',
} as const;

export const BREEDER_VERIFICATION_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '브리더를 찾을 수 없음',
    errorExample: '브리더를 찾을 수 없습니다.',
} as const;

export const BREEDER_REPORT_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '신고를 찾을 수 없음',
    errorExample: '신고를 찾을 수 없습니다.',
} as const;
