import { Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';

@Injectable()
export class BreederManagementCommandResponseFactoryService {
    createProfileUpdated() {
        return this.createMessageResponse('프로필이 성공적으로 수정되었습니다.');
    }

    createVerificationSubmitted() {
        return this.createMessageResponse('브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다.');
    }

    createVerificationDocumentsSubmitted() {
        return this.createMessageResponse('입점 서류 제출이 완료되었습니다. 관리자 검토 후 결과를 알려드립니다.');
    }

    createApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            ...this.createMessageResponse('입양 신청 폼이 성공적으로 업데이트되었습니다.'),
            customQuestions,
        };
    }

    createSimpleApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            ...this.createMessageResponse('입양 신청 폼이 성공적으로 업데이트되었습니다.'),
            customQuestions,
            totalQuestions: customQuestions.length,
        };
    }

    createParentPetAdded(petId: string) {
        return {
            ...this.createMessageResponse('부모견/부모묘가 성공적으로 등록되었습니다.'),
            petId,
        };
    }

    createParentPetUpdated() {
        return this.createMessageResponse('부모견/부모묘 정보가 성공적으로 수정되었습니다.');
    }

    createParentPetRemoved() {
        return this.createMessageResponse('부모견/부모묘가 성공적으로 삭제되었습니다.');
    }

    createAvailablePetAdded(petId: string) {
        return {
            ...this.createMessageResponse('분양 가능한 반려동물이 성공적으로 등록되었습니다.'),
            petId,
        };
    }

    createAvailablePetUpdated() {
        return this.createMessageResponse('분양 개체 정보가 성공적으로 수정되었습니다.');
    }

    createAvailablePetRemoved() {
        return this.createMessageResponse('분양 개체가 성공적으로 삭제되었습니다.');
    }

    createAvailablePetStatusUpdated() {
        return this.createMessageResponse('반려동물 상태가 성공적으로 업데이트되었습니다.');
    }

    createApplicationStatusUpdated() {
        return this.createMessageResponse('입양 신청 상태가 성공적으로 업데이트되었습니다.');
    }

    private createMessageResponse(message: string) {
        return { message };
    }
}
