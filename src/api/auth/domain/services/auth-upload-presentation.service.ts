import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthUploadPresentationService {
    getProfileUploadMessage(hasAuthenticatedUser: boolean, tempId?: string): string {
        if (hasAuthenticatedUser) {
            return '프로필 이미지가 업로드되고 저장되었습니다.';
        }

        if (tempId) {
            return '프로필 이미지가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.';
        }

        return '프로필 이미지가 업로드되었습니다. 회원가입 시 응답의 filename 필드를 profileImage에 사용하세요.';
    }

    getBreederDocumentsUploadMessage(level: string, count: number, tempId?: string): string {
        if (tempId) {
            return `${level} 레벨 브리더 인증 서류 ${count}개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.`;
        }

        return `${level} 레벨 브리더 인증 서류 ${count}개가 업로드되었습니다.`;
    }
}
