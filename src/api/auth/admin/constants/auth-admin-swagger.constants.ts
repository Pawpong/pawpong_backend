export const AUTH_ADMIN_UNAUTHORIZED_RESPONSE = {
    status: 401,
    description: '인증 실패',
    errorExample: '이메일 또는 비밀번호가 올바르지 않습니다.',
};

export const AUTH_ADMIN_INVALID_TOKEN_RESPONSE = {
    status: 401,
    description: '유효하지 않은 토큰',
    errorExample: '유효하지 않은 토큰입니다.',
};
