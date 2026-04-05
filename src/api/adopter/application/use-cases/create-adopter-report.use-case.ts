import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ReportCreateRequestDto } from '../../dto/request/report-create-request.dto';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { AdopterReportCommandPort } from '../ports/adopter-report-command.port';
import { AdopterReportPayloadBuilderService } from '../../domain/services/adopter-report-payload-builder.service';
import { AdopterReportResponseFactoryService } from '../../domain/services/adopter-report-response-factory.service';

@Injectable()
export class CreateAdopterReportUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        private readonly adopterReportCommandPort: AdopterReportCommandPort,
        private readonly adopterReportPayloadBuilderService: AdopterReportPayloadBuilderService,
        private readonly adopterReportResponseFactoryService: AdopterReportResponseFactoryService,
    ) {}

    async execute(userId: string, dto: ReportCreateRequestDto) {
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

        return this.adopterReportResponseFactoryService.create(reportId);
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
