import { Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';

export const BREEDER_MANAGEMENT_RESPONSE_MESSAGES = {
    profileUpdated: '프로필이 성공적으로 수정되었습니다.',
    verificationSubmitted: '브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다.',
    verificationDocumentsSubmitted: '입점 서류 제출이 완료되었습니다. 관리자 검토 후 결과를 알려드립니다.',
    applicationFormUpdated: '입양 신청 폼이 성공적으로 업데이트되었습니다.',
    parentPetAdded: '부모견/부모묘가 성공적으로 등록되었습니다.',
    parentPetUpdated: '부모견/부모묘 정보가 성공적으로 수정되었습니다.',
    parentPetRemoved: '부모견/부모묘가 성공적으로 삭제되었습니다.',
    availablePetAdded: '분양 가능한 반려동물이 성공적으로 등록되었습니다.',
    availablePetUpdated: '분양 개체 정보가 성공적으로 수정되었습니다.',
    availablePetRemoved: '분양 개체가 성공적으로 삭제되었습니다.',
    availablePetStatusUpdated: '반려동물 상태가 성공적으로 업데이트되었습니다.',
    applicationStatusUpdated: '입양 신청 상태가 성공적으로 업데이트되었습니다.',
    reviewReplyDeleted: '답글이 삭제되었습니다.',
    accountDeleted: '브리더 회원 탈퇴가 성공적으로 처리되었습니다.',
} as const;

@Injectable()
export class BreederManagementCommandResponseFactoryService {
    createProfileUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated);
    }

    createVerificationSubmitted() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmitted);
    }

    createVerificationDocumentsSubmitted() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmitted);
    }

    createApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated),
            customQuestions,
        };
    }

    createSimpleApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated),
            customQuestions,
            totalQuestions: customQuestions.length,
        };
    }

    createParentPetAdded(petId: string) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAdded),
            petId,
        };
    }

    createParentPetUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdated);
    }

    createParentPetRemoved() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemoved);
    }

    createAvailablePetAdded(petId: string) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAdded),
            petId,
        };
    }

    createAvailablePetUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdated);
    }

    createAvailablePetRemoved() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemoved);
    }

    createAvailablePetStatusUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetStatusUpdated);
    }

    createApplicationStatusUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdated);
    }

    createReviewReplyAdded(reviewId: string, replyContent: string, replyWrittenAt: Date) {
        return {
            reviewId,
            replyContent,
            replyWrittenAt: replyWrittenAt.toISOString(),
        };
    }

    createReviewReplyUpdated(
        reviewId: string,
        replyContent: string,
        replyWrittenAt?: Date | null,
        replyUpdatedAt?: Date | null,
    ) {
        return {
            reviewId,
            replyContent,
            replyWrittenAt: replyWrittenAt?.toISOString(),
            replyUpdatedAt: replyUpdatedAt?.toISOString(),
        };
    }

    createReviewReplyDeleted(reviewId: string) {
        return {
            reviewId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        };
    }

    createAccountDeleted(userId: string, deletedAt: Date) {
        return {
            breederId: userId,
            deletedAt: deletedAt.toISOString(),
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.accountDeleted,
        };
    }

    private createMessageResponse(message: string) {
        return { message };
    }
}
