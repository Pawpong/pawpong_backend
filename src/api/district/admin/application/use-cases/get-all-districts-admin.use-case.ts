import { Inject, Injectable } from '@nestjs/common';

import { DistrictResponseDto } from '../../../dto/response/district-response.dto';
import { DistrictAdminPresentationService } from '../../../domain/services/district-admin-presentation.service';
import { DISTRICT_ADMIN_READER, type DistrictAdminReaderPort } from '../ports/district-admin-reader.port';

@Injectable()
export class GetAllDistrictsAdminUseCase {
    constructor(
        @Inject(DISTRICT_ADMIN_READER)
        private readonly districtAdminReader: DistrictAdminReaderPort,
        private readonly districtAdminPresentationService: DistrictAdminPresentationService,
    ) {}

    async execute(): Promise<DistrictResponseDto[]> {
        const districts = await this.districtAdminReader.readAll();
        return districts.map((district) => this.districtAdminPresentationService.toResponseDto(district));
    }
}
