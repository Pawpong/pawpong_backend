import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_CREATED_EVENT,
    OPS_PENDING_KIND,
    type OpsPendingCreatedEvent,
} from '../../../../../common/events/ops-pending.event';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_REPORT_COMMAND_PORT, type AdopterReportCommandPort } from '../ports/adopter-report-command.port';
import { AdopterReportPayloadBuilderService } from '../../domain/services/adopter-report-payload-builder.service';
import type { AdopterReportCreateCommand } from '../types/adopter-report-command.type';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../constants/adopter-response-messages';

@Injectable()
export class CreateAdopterReportUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_REPORT_COMMAND_PORT)
        private readonly adopterReportCommandPort: AdopterReportCommandPort,
        private readonly adopterReportPayloadBuilderService: AdopterReportPayloadBuilderService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(userId: string, dto: AdopterReportCreateCommand) {
        if (dto.reason === 'other' && (!dto.description || dto.description.trim() === '')) {
            throw new DomainValidationError('기타 사유를 선택한 경우 상세 내용을 입력해주세요.');
        }

        const reporterName = await this.resolveReporterName(userId);
        const breeder = await this.adopterBreederReaderPort.findById(dto.breederId);
        if (!breeder) {
            throw new DomainNotFoundError('신고할 브리더를 찾을 수 없습니다.');
        }

        const { reportId, report } = this.adopterReportPayloadBuilderService.build(userId, reporterName, dto);
        await this.adopterReportCommandPort.addReport(dto.breederId, report);

        // 신고는 관리자가 처리해야 끝난다. 신고 본문은 방에 남기지 않고 어드민에서 확인하게 한다.
        const opsEvent: OpsPendingCreatedEvent = {
            kind: OPS_PENDING_KIND.BREEDER_REPORT,
            referenceId: reportId,
            summary: '브리더 신고가 접수되었습니다. 어드민에서 내용을 확인해주세요.',
            details: [
                { name: '신고 ID', value: reportId },
                { name: '브리더 ID', value: dto.breederId },
                { name: '신고 사유', value: dto.reason },
            ],
        };
        await this.eventEmitter.emitAsync(OPS_PENDING_CREATED_EVENT, opsEvent);

        return {
            reportId,
            message: ADOPTER_RESPONSE_PAYLOAD_MESSAGES.reportAccepted,
        };
    }

    private async resolveReporterName(userId: string): Promise<string> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (adopter) {
            return adopter.nickname;
        }

        const breeder = await this.adopterBreederReaderPort.findById(userId);
        if (breeder) {
            return breeder.name;
        }

        throw new DomainNotFoundError('사용자 정보를 찾을 수 없습니다.');
    }
}
