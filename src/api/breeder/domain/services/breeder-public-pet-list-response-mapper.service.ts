import { Injectable } from '@nestjs/common';

import type { BreederFileUrlPort } from '../../application/ports/breeder-file-url.port';
import type { BreederPublicPetRecord } from '../../application/ports/breeder-public-reader.port';
import { BreederBirthDateFormatterService } from './breeder-birth-date-formatter.service';
import { BreederPaginationAssemblerService } from './breeder-pagination-assembler.service';
import type { BreederPetParentResult, BreederPetsPageResult } from '../../application/types/breeder-result.type';

@Injectable()
export class BreederPublicPetListResponseMapperService {
    constructor(
        private readonly breederBirthDateFormatterService: BreederBirthDateFormatterService,
        private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService,
    ) {}

    toPaginationResponse(
        pets: BreederPublicPetRecord[],
        status: string | undefined,
        page: number,
        limit: number,
        fileUrlPort: BreederFileUrlPort,
    ): BreederPetsPageResult {
        const availableCount = pets.filter((pet) => pet.status === 'available').length;
        const reservedCount = pets.filter((pet) => pet.status === 'reserved').length;
        const adoptedCount = pets.filter((pet) => pet.status === 'adopted').length;

        const filteredPets = status ? pets.filter((pet) => pet.status === status) : pets;
        const skip = (page - 1) * limit;
        const pagedPets = filteredPets.slice(skip, skip + limit);

        const items = pagedPets.map((pet) => {
            const birthDate = pet.birthDate;
            const now = new Date();
            const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const photos = fileUrlPort.generateMany(pet.photos || [], 60 * 24);

            const parents: BreederPetParentResult[] = [];
            if (pet.parentInfo?.mother) {
                const mother = pet.parentInfo.mother;
                const motherPhotos = fileUrlPort.generateMany(mother.photos || [], 60 * 24);
                parents.push({
                    id: mother._id.toString(),
                    avatarUrl: motherPhotos[0] || fileUrlPort.generateOneSafe(mother.photoFileName, 60 * 24) || '',
                    name: mother.name,
                    sex: mother.gender,
                    birth: this.breederBirthDateFormatterService.formatToKorean(mother.birthDate),
                    breed: mother.breed,
                    photos: motherPhotos,
                });
            }

            if (pet.parentInfo?.father) {
                const father = pet.parentInfo.father;
                const fatherPhotos = fileUrlPort.generateMany(father.photos || [], 60 * 24);
                parents.push({
                    id: father._id.toString(),
                    avatarUrl: fatherPhotos[0] || fileUrlPort.generateOneSafe(father.photoFileName, 60 * 24) || '',
                    name: father.name,
                    sex: father.gender,
                    birth: this.breederBirthDateFormatterService.formatToKorean(father.birthDate),
                    breed: father.breed,
                    photos: fatherPhotos,
                });
            }

            return {
                petId: pet._id.toString(),
                name: pet.name,
                breed: pet.breed,
                gender: pet.gender,
                birthDate: pet.birthDate,
                ageInMonths,
                price: pet.price,
                status: pet.status,
                description: pet.description || '',
                mainPhoto: photos[0] || '',
                photos,
                photoCount: photos.length,
                isVaccinated: (pet.vaccinations?.length || 0) > 0,
                hasMicrochip: !!pet.microchipNumber,
                availableFrom: pet.availableFrom,
                parents,
            };
        });

        const pageResult = this.breederPaginationAssemblerService.build(
            items,
            page,
            limit,
            filteredPets.length,
        );

        return {
            ...pageResult,
            availableCount,
            reservedCount,
            adoptedCount,
        };
    }
}
