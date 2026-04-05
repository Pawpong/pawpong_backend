import { Inject, Injectable } from '@nestjs/common';

import { DISTRICT_READER, type DistrictReaderPort } from '../ports/district-reader.port';
import { DistrictOrderingService } from '../../domain/services/district-ordering.service';
import { GetDistrictsResponseDto } from '../../dto/response/get-districts-response.dto';

@Injectable()
export class GetAllDistrictsUseCase {
    constructor(
        @Inject(DISTRICT_READER)
        private readonly districtReader: DistrictReaderPort,
        private readonly districtOrderingService: DistrictOrderingService,
    ) {}

    async execute(): Promise<GetDistrictsResponseDto[]> {
        const districts = await this.districtReader.readAll();
        return this.districtOrderingService.sortByStandardCityOrder(districts);
    }
}
