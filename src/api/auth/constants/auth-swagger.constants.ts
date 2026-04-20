export const AUTH_REFRESH_UNAUTHORIZED_RESPONSE = {
    status: 401,
    description: '토큰 인증 실패',
    errorExample: '유효하지 않은 리프레시 토큰입니다.',
};

export const AUTH_PHONE_SEND_FAILURE_RESPONSE = {
    status: 500,
    description: '인증번호 발송 실패',
    errorExample: '인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
};
