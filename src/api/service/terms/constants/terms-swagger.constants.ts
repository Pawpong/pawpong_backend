export const TERMS_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '약관을 찾을 수 없음',
    errorExample: '해당 약관을 찾을 수 없습니다.',
} as const;

export const TERMS_CODE_VALUES = ['service', 'privacy', 'marketing', 'age_14plus', 'counsel_privacy'] as const;

export const TERMS_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
} as const;

export const TERMS_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '약관을 찾을 수 없음',
    errorExample: '해당 약관을 찾을 수 없습니다.',
} as const;

export const TERMS_ADMIN_ACTIVE_DELETE_CONFLICT_RESPONSE = {
    status: 409,
    description: '활성 약관은 삭제 불가',
    errorExample: '활성 상태인 약관은 삭제할 수 없습니다. 다른 버전을 활성화한 뒤 삭제해주세요. (service 2025-12-21)',
} as const;

export const TERMS_ADMIN_DUPLICATE_VERSION_RESPONSE = {
    status: 409,
    description: '같은 code+version 이 이미 존재함',
    errorExample: '이미 존재하는 약관 버전입니다: service 2025-12-21',
} as const;
