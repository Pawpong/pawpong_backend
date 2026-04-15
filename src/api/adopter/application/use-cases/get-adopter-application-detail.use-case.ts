import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { ADOPTER_APPLICATION_READER_PORT } from '../ports/adopter-application-reader.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterApplicationReaderPort } from '../ports/adopter-application-reader.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterApplicationDetailAssemblerService } from '../../domain/services/adopter-application-detail-assembler.service';
import type { AdopterApplicationDetailResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterApplicationDetailUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_APPLICATION_READER_PORT)
        private readonly adopterApplicationReaderPort: AdopterApplicationReaderPort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        private readonly adopterApplicationDetailAssemblerService: AdopterApplicationDetailAssemblerService,
    ) {}

    async execute(userId: string, applicationId: string): Promise<AdopterApplicationDetailResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        const application = await this.adopterApplicationReaderPort.findByIdForAdopter(userId, applicationId);
        if (!application) {
            throw new DomainNotFoundError('해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.');
        }

        const breeder = await this.adopterBreederReaderPort.findById(application.breederId.toString());
        return this.adopterApplicationDetailAssemblerService.toResponse(application, breeder);
    }
}
