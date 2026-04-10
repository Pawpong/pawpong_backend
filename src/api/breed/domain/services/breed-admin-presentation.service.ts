import { Injectable } from '@nestjs/common';

import { BreedAdminSnapshot } from '../../admin/application/ports/breed-admin-reader.port';

@Injectable()
export class BreedAdminPresentationService {
    toResponseDto(breed: BreedAdminSnapshot) {
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
