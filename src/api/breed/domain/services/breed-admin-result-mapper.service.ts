import { Injectable } from '@nestjs/common';

import { BreedAdminSnapshot } from '../../admin/application/ports/breed-admin-reader.port';
import type { BreedAdminItemResult } from '../../admin/application/types/breed-result.type';

@Injectable()
export class BreedAdminResultMapperService {
    toResult(breed: BreedAdminSnapshot): BreedAdminItemResult {
        return {
            id: breed.id,
            petType: breed.petType,
            category: breed.category,
            categoryDescription: breed.categoryDescription,
            breeds: breed.breeds,
            createdAt: breed.createdAt,
            updatedAt: breed.updatedAt,
        };
    }
}
