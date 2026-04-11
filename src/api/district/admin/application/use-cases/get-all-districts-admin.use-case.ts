import { Inject, Injectable } from '@nestjs/common';

import type { DistrictAdminResult } from '../../../application/types/district-result.type';
import { DistrictAdminResultMapperService } from '../../../domain/services/district-admin-result-mapper.service';
import { DISTRICT_ADMIN_READER_PORT, type DistrictAdminReaderPort } from '../ports/district-admin-reader.port';

@Injectable()
export class GetAllDistrictsAdminUseCase {
    constructor(
        @Inject(DISTRICT_ADMIN_READER_PORT)
        private readonly districtAdminReader: DistrictAdminReaderPort,
        private readonly districtAdminResultMapperService: DistrictAdminResultMapperService,
    ) {}

    async execute(): Promise<DistrictAdminResult[]> {
        const districts = await this.districtAdminReader.readAll();
        return districts.map((district) => this.districtAdminResultMapperService.toResult(district));
    }
}
