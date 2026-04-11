import { ConflictException, Inject, Injectable } from '@nestjs/common';

import type { DistrictAdminResult } from '../../../application/types/district-result.type';
import { DistrictAdminResultMapperService } from '../../../domain/services/district-admin-result-mapper.service';
import { DISTRICT_ADMIN_READER_PORT, type DistrictAdminReaderPort } from '../ports/district-admin-reader.port';
import { DISTRICT_WRITER_PORT, type DistrictWriterPort } from '../ports/district-writer.port';
import { CreateDistrictCommand } from '../types/district-command.type';

@Injectable()
export class CreateDistrictUseCase {
    constructor(
        @Inject(DISTRICT_ADMIN_READER_PORT)
        private readonly districtAdminReader: DistrictAdminReaderPort,
        @Inject(DISTRICT_WRITER_PORT)
        private readonly districtWriter: DistrictWriterPort,
        private readonly districtAdminResultMapperService: DistrictAdminResultMapperService,
    ) {}

    async execute(dto: CreateDistrictCommand): Promise<DistrictAdminResult> {
        const existing = await this.districtAdminReader.findByCity(dto.city);

        if (existing) {
            throw new ConflictException(`이미 ${dto.city} 데이터가 존재합니다.`);
        }

        const district = await this.districtWriter.create(dto);
        return this.districtAdminResultMapperService.toResult(district);
    }
}
