import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { AdopterReportCommandPort } from '../ports/adopter-report-command.port';
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
        private readonly adopterReportCommandPort: AdopterReportCommandPort,
        private readonly adopterReportPayloadBuilderService: AdopterReportPayloadBuilderService,
    ) {}

    async execute(userId: string, dto: AdopterReportCreateCommand) {
        if (dto.reason === 'other' && (!dto.description || dto.description.trim() === '')) {
            throw new BadRequestException('기타 사유를 선택한 경우 상세 내용을 입력해주세요.');
        }

        const reporterName = await this.resolveReporterName(userId);
        const breeder = await this.adopterBreederReaderPort.findById(dto.breederId);
        if (!breeder) {
            throw new BadRequestException('신고할 브리더를 찾을 수 없습니다.');
        }

        const { reportId, report } = this.adopterReportPayloadBuilderService.build(userId, reporterName, dto);
        await this.adopterReportCommandPort.addReport(dto.breederId, report);

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

        throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
    }
}
