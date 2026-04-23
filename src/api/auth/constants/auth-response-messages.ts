export const AUTH_RESPONSE_MESSAGE_EXAMPLES = {
    adopterSignupCompleted: '입양자 회원가입이 완료되었습니다.',
    breederSignupCompleted: '브리더 회원가입이 완료되었습니다.',
    socialRegistrationCompleted: '소셜 회원가입이 완료되었습니다.',
    logoutCompleted: '로그아웃되었습니다.',
    tokenRefreshed: '토큰이 재발급되었습니다.',
    emailAvailable: '사용 가능한 이메일입니다.',
    emailDuplicated: '이미 가입된 이메일입니다.',
    nicknameAvailable: '사용 가능한 닉네임입니다.',
    nicknameDuplicated: '이미 사용 중인 닉네임입니다.',
    breederNameAvailable: '사용 가능한 상호명입니다.',
    breederNameDuplicated: '이미 사용 중인 상호명입니다.',
    socialUserFound: '가입된 사용자입니다.',
    socialUserNotFound: '미가입 사용자입니다.',
    phoneVerificationCodeSent: '인증번호가 발송되었습니다.',
    phoneVerificationCompleted: '전화번호 인증이 완료되었습니다.',
    loginBannersListed: '로그인 페이지 배너가 조회되었습니다.',
    registerBannersListed: '회원가입 페이지 배너가 조회되었습니다.',
    profileImageUploaded:
        '프로필 이미지가 업로드되었습니다. 회원가입 시 응답의 filename 필드를 profileImage에 사용하세요.',
    profileImageUploadedAndSaved: '프로필 이미지가 업로드되고 저장되었습니다.',
    profileImageUploadedAndTempStored:
        '프로필 이미지가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
    breederDocumentsUploaded: 'new 레벨 브리더 인증 서류 2개가 업로드되었습니다.',
    breederDocumentsUploadedAndTempStored:
        'new 레벨 브리더 인증 서류 2개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
} as const;

export function buildAuthLogoutResult(loggedOutAt: string) {
    return {
        success: true,
        loggedOutAt,
        message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
    } as const;
}

export function buildAuthDuplicateCheckMessage(
    kind: 'email' | 'nickname' | 'breederName',
    isDuplicate: boolean,
): string {
    if (kind === 'email') {
        return isDuplicate
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.emailDuplicated
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.emailAvailable;
    }

    if (kind === 'nickname') {
        return isDuplicate
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameDuplicated
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameAvailable;
    }

    return isDuplicate
        ? AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameDuplicated
        : AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameAvailable;
}

export function buildAuthProfileUploadMessage(hasAuthenticatedUser: boolean, tempId?: string): string {
    if (hasAuthenticatedUser) {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploadedAndSaved;
    }

    if (tempId) {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploadedAndTempStored;
    }

    return AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploaded;
}

export function buildAuthPhoneVerificationCodeSentResult() {
    return {
        success: true,
        message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent,
    } as const;
}

export function buildAuthPhoneVerificationCompletedResult() {
    return {
        success: true,
        message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted,
    } as const;
}

export function buildAuthBreederDocumentsUploadMessage(level: string, count: number, tempId?: string): string {
    if (tempId) {
        return `${level} 레벨 브리더 인증 서류 ${count}개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.`;
    }

    return `${level} 레벨 브리더 인증 서류 ${count}개가 업로드되었습니다.`;
}
