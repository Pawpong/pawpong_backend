import { Injectable } from '@nestjs/common';

import type { BreederManagementPetRecord } from '../../application/ports/breeder-management-list-reader.port';

@Injectable()
export class BreederManagementMyPetMapperService {
    toItem(pet: BreederManagementPetRecord, applicationCountMap: Map<string, number>) {
        const birthDate = new Date(pet.birthDate);
        const ageInMonths = Number.isNaN(birthDate.getTime())
            ? 0
            : Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const petId = pet.petId || String(pet._id);

        return {
            petId,
            name: pet.name,
            breed: pet.breed,
            gender: pet.gender,
            birthDate: pet.birthDate,
            ageInMonths,
            price: pet.price,
            status: pet.status,
            isActive: pet.isActive,
            mainPhoto: pet.photos?.[0] || '',
            photoCount: pet.photos?.length || 0,
            viewCount: pet.viewCount || 0,
            applicationCount: applicationCountMap.get(petId) || 0,
            createdAt: pet.createdAt,
            updatedAt: pet.updatedAt,
        };
    }
}
