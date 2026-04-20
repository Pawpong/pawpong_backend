import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
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
            throw new DomainNotFoundError(`ID ${id}에 해당하는 지역을 찾을 수 없습니다.`);
        }

        return this.districtAdminResultMapperService.toResult(district);
    }
}
