import { Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './breeder-management-response-message.service';

@Injectable()
export class BreederManagementCommandResponseFactoryService {
    createProfileUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated);
    }

    createVerificationSubmitted() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed);
    }

    createVerificationDocumentsSubmitted() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmittedDetailed);
    }

    createApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed),
            customQuestions,
        };
    }

    createSimpleApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed),
            customQuestions,
            totalQuestions: customQuestions.length,
        };
    }

    createParentPetAdded(petId: string) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed),
            petId,
        };
    }

    createParentPetUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdatedDetailed);
    }

    createParentPetRemoved() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemovedDetailed);
    }

    createAvailablePetAdded(petId: string) {
        return {
            ...this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed),
            petId,
        };
    }

    createAvailablePetUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdatedDetailed);
    }

    createAvailablePetRemoved() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemovedDetailed);
    }

    createAvailablePetStatusUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed);
    }

    createApplicationStatusUpdated() {
        return this.createMessageResponse(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed);
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
