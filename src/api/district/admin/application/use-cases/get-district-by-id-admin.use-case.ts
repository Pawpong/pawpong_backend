import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import type { DistrictAdminResult } from '../../../application/types/district-result.type';
import { DistrictAdminResultMapperService } from '../../../domain/services/district-admin-result-mapper.service';
import { DISTRICT_ADMIN_READER_PORT, type DistrictAdminReaderPort } from '../ports/district-admin-reader.port';

@Injectable()
export class GetDistrictByIdAdminUseCase {
    constructor(
        @Inject(DISTRICT_ADMIN_READER_PORT)
        private readonly districtAdminReader: DistrictAdminReaderPort,
        private readonly districtAdminResultMapperService: DistrictAdminResultMapperService,
    ) {}

    async execute(id: string): Promise<DistrictAdminResult> {
        const district = await this.districtAdminReader.findById(id);

        if (!district) {
            throw new BadRequestException(`ID ${id}에 해당하는 지역을 찾을 수 없습니다.`);
        }

        return this.districtAdminResultMapperService.toResult(district);
    }
}
