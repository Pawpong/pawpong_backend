import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_CREATED_EVENT,
    OPS_PENDING_KIND,
    type OpsPendingCreatedEvent,
} from '../../../../../common/events/ops-pending.event';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_REVIEW_COMMAND_PORT, type AdopterReviewCommandPort } from '../ports/adopter-review-command.port';
import type { AdopterReviewReportCommand } from '../types/adopter-review-command.type';
import type { AdopterReviewReportResult } from '../types/adopter-result.type';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../constants/adopter-response-messages';

@Injectable()
export class ReportAdopterReviewUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_REVIEW_COMMAND_PORT)
        private readonly adopterReviewCommandPort: AdopterReviewCommandPort,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(userId: string, dto: AdopterReviewReportCommand): Promise<AdopterReviewReportResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        const breeder = await this.adopterBreederReaderPort.findById(userId);

        if (!adopter && !breeder) {
            throw new DomainNotFoundError('사용자 정보를 찾을 수 없습니다.');
        }

        const review = await this.adopterReviewCommandPort.findReviewById(dto.reviewId);
        if (!review) {
            throw new DomainNotFoundError('신고할 후기를 찾을 수 없습니다.');
        }

        await this.adopterReviewCommandPort.markAsReported(
            dto.reviewId,
            userId,
            dto.reason,
            dto.description || '',
            new Date(),
        );

        // 후기 신고는 숨김/삭제 판단이 필요해 관리자 처리 대기로 올린다.
        const opsEvent: OpsPendingCreatedEvent = {
            kind: OPS_PENDING_KIND.REVIEW_REPORT,
            referenceId: dto.reviewId,
            summary: '후기 신고가 접수되었습니다. 어드민에서 내용을 확인해주세요.',
            details: [
                { name: '후기 ID', value: dto.reviewId },
                { name: '신고 사유', value: dto.reason },
            ],
        };
        await this.eventEmitter.emitAsync(OPS_PENDING_CREATED_EVENT, opsEvent);

        return {
            message: ADOPTER_RESPONSE_PAYLOAD_MESSAGES.reviewReported,
        };
    }
}
