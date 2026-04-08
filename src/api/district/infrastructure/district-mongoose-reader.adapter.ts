import { Injectable } from '@nestjs/common';

import { type DistrictReaderPort } from '../application/ports/district-reader.port';
import { GetDistrictsResponseDto } from '../dto/response/get-districts-response.dto';
import { DistrictRepository } from '../repository/district.repository';

@Injectable()
export class DistrictMongooseReaderAdapter implements DistrictReaderPort {
    constructor(private readonly districtRepository: DistrictRepository) {}

    async readAll(): Promise<GetDistrictsResponseDto[]> {
        const districts = await this.districtRepository.findAll();

        return districts.map((district) => ({
            city: district.city,
            districts: district.districts,
        }));
    }
}
