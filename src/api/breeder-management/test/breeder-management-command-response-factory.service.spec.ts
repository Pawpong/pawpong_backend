import { BreederManagementCommandResponseFactoryService } from '../domain/services/breeder-management-command-response-factory.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 명령 응답 팩토리 서비스', () => {
    const service = new BreederManagementCommandResponseFactoryService();

    it('message-only 응답을 일관된 형태로 만든다', () => {
        expect(service.createProfileUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated,
        });

        expect(service.createVerificationSubmitted()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed,
        });

        expect(service.createVerificationDocumentsSubmitted()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmittedDetailed,
        });

        expect(service.createApplicationStatusUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed,
        });
    });

    it('pet 생성 응답에 개체 ID와 message를 함께 담는다', () => {
        expect(service.createParentPetAdded('parent-pet-id')).toEqual({
            petId: 'parent-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed,
        });

        expect(service.createAvailablePetAdded('available-pet-id')).toEqual({
            petId: 'available-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed,
        });
    });

    it('신청 폼 응답의 추가 필드를 유지한다', () => {
        const customQuestions = [
            {
                id: 'custom_pet_experience',
                type: 'textarea',
                label: '반려 경험이 있나요?',
                required: false,
                order: 1,
            },
        ];

        expect(service.createApplicationFormUpdated(customQuestions)).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
        });

        expect(service.createSimpleApplicationFormUpdated(customQuestions)).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
            totalQuestions: 1,
        });
    });

    it('review reply 응답을 일관된 형태로 만든다', () => {
        const replyWrittenAt = new Date('2026-04-08T10:00:00.000Z');
        const replyUpdatedAt = new Date('2026-04-08T10:05:00.000Z');

        expect(service.createReviewReplyAdded('review-id', '답글 내용', replyWrittenAt)).toEqual({
            reviewId: 'review-id',
            replyContent: '답글 내용',
            replyWrittenAt: replyWrittenAt.toISOString(),
        });

        expect(service.createReviewReplyUpdated('review-id', '수정된 답글', replyWrittenAt, replyUpdatedAt)).toEqual({
            reviewId: 'review-id',
            replyContent: '수정된 답글',
            replyWrittenAt: replyWrittenAt.toISOString(),
            replyUpdatedAt: replyUpdatedAt.toISOString(),
        });

        expect(service.createReviewReplyDeleted('review-id')).toEqual({
            reviewId: 'review-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        });
    });

    it('계정 탈퇴 응답을 일관된 형태로 만든다', () => {
        const deletedAt = new Date('2026-04-08T10:10:00.000Z');

        expect(service.createAccountDeleted('breeder-id', deletedAt)).toEqual({
            breederId: 'breeder-id',
            deletedAt: deletedAt.toISOString(),
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.accountDeleted,
        });
    });
});
