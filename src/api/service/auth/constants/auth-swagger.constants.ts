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

export const AUTH_REACTIVATION_UNAUTHORIZED_RESPONSE = {
    status: 401,
    description: '복구 토큰 검증 실패',
    errorExample: '복구 요청이 만료되었습니다. 다시 로그인해주세요.',
};

export const AUTH_REACTIVATION_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '복구 대상 계정 없음',
    errorExample: '복구할 계정을 찾을 수 없습니다.',
};
