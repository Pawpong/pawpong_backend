import { Injectable } from '@nestjs/common';

import { DistrictResponseDto } from '../../dto/response/district-response.dto';
import { DistrictSnapshot } from '../../admin/application/ports/district-admin-reader.port';

@Injectable()
export class DistrictAdminPresentationService {
    toResponseDto(district: DistrictSnapshot): DistrictResponseDto {
        return {
            id: district.id,
            city: district.city,
            districts: district.districts,
            createdAt: district.createdAt,
            updatedAt: district.updatedAt,
        };
    }
}
