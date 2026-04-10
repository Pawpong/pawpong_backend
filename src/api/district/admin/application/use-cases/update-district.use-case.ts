import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import type { DistrictAdminResult } from '../../../application/types/district-result.type';
import { DistrictAdminPresentationService } from '../../../domain/services/district-admin-presentation.service';
import { DISTRICT_ADMIN_READER, type DistrictAdminReaderPort } from '../ports/district-admin-reader.port';
import { DISTRICT_WRITER, type DistrictWriterPort } from '../ports/district-writer.port';
import { UpdateDistrictCommand } from '../types/district-command.type';

@Injectable()
export class UpdateDistrictUseCase {
    constructor(
        @Inject(DISTRICT_ADMIN_READER)
        private readonly districtAdminReader: DistrictAdminReaderPort,
        @Inject(DISTRICT_WRITER)
        private readonly districtWriter: DistrictWriterPort,
        private readonly districtAdminPresentationService: DistrictAdminPresentationService,
    ) {}

    async execute(id: string, dto: UpdateDistrictCommand): Promise<DistrictAdminResult> {
        const district = await this.districtAdminReader.findById(id);

        if (!district) {
            throw new BadRequestException(`ID ${id}에 해당하는 지역을 찾을 수 없습니다.`);
        }

        if (dto.city && dto.city !== district.city) {
            const duplicated = await this.districtAdminReader.findByCity(dto.city, id);

            if (duplicated) {
                throw new ConflictException(`이미 ${dto.city} 데이터가 존재합니다.`);
            }
        }

        const updated = await this.districtWriter.update(id, dto);

        if (!updated) {
            throw new BadRequestException(`ID ${id}에 해당하는 지역을 찾을 수 없습니다.`);
        }

        return this.districtAdminPresentationService.toResponseDto(updated);
    }
}
