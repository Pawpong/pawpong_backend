import { Inject, Injectable } from '@nestjs/common';

import type { DistrictAdminResult } from '../../../application/types/district-result.type';
import { DistrictAdminPresentationService } from '../../../domain/services/district-admin-presentation.service';
import { DISTRICT_ADMIN_READER_PORT, type DistrictAdminReaderPort } from '../ports/district-admin-reader.port';

@Injectable()
export class GetAllDistrictsAdminUseCase {
    constructor(
        @Inject(DISTRICT_ADMIN_READER_PORT)
        private readonly districtAdminReader: DistrictAdminReaderPort,
        private readonly districtAdminPresentationService: DistrictAdminPresentationService,
    ) {}

    async execute(): Promise<DistrictAdminResult[]> {
        const districts = await this.districtAdminReader.readAll();
        return districts.map((district) => this.districtAdminPresentationService.toResponseDto(district));
    }
}
