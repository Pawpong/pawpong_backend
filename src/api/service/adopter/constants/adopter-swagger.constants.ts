export const ADOPTER_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '입양자 권한이 필요합니다.',
} as const;

export const ADOPTER_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const ADOPTER_ADMIN_REVIEW_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '후기를 찾을 수 없음',
    errorExample: '후기를 찾을 수 없습니다.',
} as const;

export const ADOPTER_ADMIN_APPLICATION_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '입양 신청을 찾을 수 없음',
    errorExample: '입양 신청을 찾을 수 없습니다.',
} as const;
