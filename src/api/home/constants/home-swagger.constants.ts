export const HOME_FAQ_USER_TYPES = ['adopter', 'breeder'] as const;

export const HOME_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

export const HOME_ADMIN_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
};

export const HOME_ADMIN_BANNER_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '배너를 찾을 수 없음',
    errorExample: '배너를 찾을 수 없습니다.',
};

export const HOME_ADMIN_FAQ_NOT_FOUND_RESPONSE = {
    status: 400,
    description: 'FAQ를 찾을 수 없음',
    errorExample: 'FAQ를 찾을 수 없습니다.',
};
