import { Injectable } from '@nestjs/common';

export const AUTH_RESPONSE_MESSAGE_EXAMPLES = {
    adopterSignupCompleted: '입양자 회원가입이 완료되었습니다.',
    breederSignupCompleted: '브리더 회원가입이 완료되었습니다.',
    socialRegistrationCompleted: '소셜 회원가입이 완료되었습니다.',
    logoutCompleted: '로그아웃되었습니다.',
    phoneVerificationCodeSent: '인증번호가 발송되었습니다.',
    phoneVerificationCompleted: '전화번호 인증이 완료되었습니다.',
    profileImageUploaded:
        '프로필 이미지가 업로드되었습니다. 회원가입 시 응답의 filename 필드를 profileImage에 사용하세요.',
    profileImageUploadedAndSaved: '프로필 이미지가 업로드되고 저장되었습니다.',
    profileImageUploadedAndTempStored:
        '프로필 이미지가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
    breederDocumentsUploaded: 'new 레벨 브리더 인증 서류 2개가 업로드되었습니다.',
    breederDocumentsUploadedAndTempStored:
        'new 레벨 브리더 인증 서류 2개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
} as const;

export function buildAuthBreederDocumentsUploadMessage(level: string, count: number, tempId?: string): string {
    if (tempId) {
        return `${level} 레벨 브리더 인증 서류 ${count}개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.`;
    }

    return `${level} 레벨 브리더 인증 서류 ${count}개가 업로드되었습니다.`;
}

@Injectable()
export class AuthResponseMessageService {
    getSignupCompleted(role: 'adopter' | 'breeder'): string {
        return role === 'adopter'
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted;
    }

    getSocialRegistrationCompleted(): string {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted;
    }
}
