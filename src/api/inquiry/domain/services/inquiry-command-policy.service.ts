import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';
import {
    InquiryBreederInfoSnapshot,
    InquiryCommandSnapshot,
} from '../../application/ports/inquiry-command.port';
import type { InquiryAnswerCreateCommand } from '../../application/types/inquiry-command.type';

@Injectable()
export class InquiryCommandPolicyService {
    ensureTargetBreederId(targetBreederId?: string): void {
        if (!targetBreederId) {
            throw new DomainValidationError('1:1 질문은 대상 브리더를 지정해야 합니다.');
        }
    }

    ensureAuthorOwnsInquiry(inquiry: InquiryCommandSnapshot, userId: string, message: string): void {
        if (inquiry.authorId !== userId) {
            throw new DomainValidationError(message);
        }
    }

    ensureNoAnswers(inquiry: InquiryCommandSnapshot, message: string): void {
        if (inquiry.answerCount > 0) {
            throw new DomainValidationError(message);
        }
    }

    ensureInquiryAnswerable(inquiry: InquiryCommandSnapshot, breederId: string): void {
        if (inquiry.status === 'closed') {
            throw new DomainValidationError('종료된 문의에는 답변할 수 없습니다.');
        }

        if (inquiry.type === 'direct' && inquiry.targetBreederId !== breederId) {
            throw new DomainValidationError('해당 문의에 답변할 권한이 없습니다.');
        }
    }

    buildAnswerData(
        breederId: string,
        breeder: InquiryBreederInfoSnapshot,
        dto: InquiryAnswerCreateCommand,
    ): {
        breederId: string;
        breederName: string;
        profileImageUrl?: string;
        content: string;
        imageUrls: string[];
        helpfulCount: number;
        animalTypeName?: string;
        breed?: string;
    } {
        return {
            breederId,
            breederName: breeder.name,
            profileImageUrl: breeder.profileImageFileName || undefined,
            content: dto.content,
            imageUrls: dto.imageUrls || [],
            helpfulCount: 0,
            animalTypeName: breeder.petType === 'dog' ? '강아지' : breeder.petType === 'cat' ? '고양이' : undefined,
            breed: breeder.breeds?.[0],
        };
    }
}
