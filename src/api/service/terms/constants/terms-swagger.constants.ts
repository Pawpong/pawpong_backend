export const TERMS_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '약관을 찾을 수 없음',
    errorExample: '해당 약관을 찾을 수 없습니다.',
} as const;

export const TERMS_CODE_VALUES = ['service', 'privacy', 'marketing', 'age_14plus', 'counsel_privacy'] as const;
