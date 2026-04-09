export const APP_VERSION_PLATFORM_VALUES = ['ios', 'android'] as const;

export const APP_VERSION_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: 'platform 또는 currentVersion이 올바르지 않습니다.',
};

export const APP_VERSION_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

export const APP_VERSION_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '앱 버전 정보를 찾을 수 없음',
    errorExample: '앱 버전 정보를 찾을 수 없습니다.',
};
