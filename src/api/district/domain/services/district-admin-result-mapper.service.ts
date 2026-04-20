import { Injectable } from '@nestjs/common';

import { DistrictSnapshot } from '../../admin/application/ports/district-admin-reader.port';
import type { DistrictAdminResult } from '../../application/types/district-result.type';

@Injectable()
export class DistrictAdminResultMapperService {
    toResult(district: DistrictSnapshot): DistrictAdminResult {
        return {
            id: district.id,
            city: district.city,
            districts: district.districts,
            createdAt: district.createdAt,
            updatedAt: district.updatedAt,
        };
    }
}
