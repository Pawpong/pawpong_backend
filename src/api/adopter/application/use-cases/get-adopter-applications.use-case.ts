import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { ADOPTER_APPLICATION_READER_PORT } from '../ports/adopter-application-reader.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_FILE_URL_PORT } from '../ports/adopter-file-url.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterApplicationReaderPort } from '../ports/adopter-application-reader.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterFileUrlPort } from '../ports/adopter-file-url.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterApplicationListAssemblerService } from '../../domain/services/adopter-application-list-assembler.service';
import type { AdopterApplicationPageResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterApplicationsUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_APPLICATION_READER_PORT)
        private readonly adopterApplicationReaderPort: AdopterApplicationReaderPort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_FILE_URL_PORT)
        private readonly adopterFileUrlPort: AdopterFileUrlPort,
        private readonly adopterApplicationListAssemblerService: AdopterApplicationListAssemblerService,
    ) {}

    async execute(
        userId: string,
        page: number = 1,
        limit: number = 10,
        animalType?: 'cat' | 'dog',
    ): Promise<AdopterApplicationPageResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        let breederIds: string[] | undefined;
        if (animalType) {
            breederIds = await this.adopterApplicationReaderPort.findBreederIdsByAnimalType(animalType);
            if (breederIds.length === 0) {
                return this.adopterApplicationListAssemblerService.toEmptyResponse(page, limit);
            }
        }

        const totalItems = await this.adopterApplicationReaderPort.countByAdopterId(userId, breederIds);
        const applications = await this.adopterApplicationReaderPort.findPagedByAdopterId(
            userId,
            page,
            limit,
            breederIds,
        );

        const items = await Promise.all(
            applications.map(async (application) => {
                const breeder = await this.adopterBreederReaderPort.findById(application.breederId.toString());
                return this.adopterApplicationListAssemblerService.toItem(
                    application,
                    breeder,
                    this.adopterFileUrlPort,
                );
            }),
        );

        return this.adopterApplicationListAssemblerService.toPaginatedResponse(items, page, limit, totalItems);
    }
}
