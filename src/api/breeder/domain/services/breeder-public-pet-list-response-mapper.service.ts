import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import type { BreederFileUrlPort } from '../../application/ports/breeder-file-url.port';
import { PetsListResponseDto } from '../../dto/response/pets-list-response.dto';
import { BreederBirthDateFormatterService } from './breeder-birth-date-formatter.service';

@Injectable()
export class BreederPublicPetListResponseMapperService {
    constructor(private readonly breederBirthDateFormatterService: BreederBirthDateFormatterService) {}

    toPaginationResponse(pets: any[], status: string | undefined, page: number, limit: number, fileUrlPort: BreederFileUrlPort) {
        const availableCount = pets.filter((pet) => pet.status === 'available').length;
        const reservedCount = pets.filter((pet) => pet.status === 'reserved').length;
        const adoptedCount = pets.filter((pet) => pet.status === 'adopted').length;

        const filteredPets = status ? pets.filter((pet) => pet.status === status) : pets;
        const skip = (page - 1) * limit;
        const pagedPets = filteredPets.slice(skip, skip + limit);

        const items = pagedPets.map((pet: any) => {
            const birthDate = new Date(pet.birthDate);
            const now = new Date();
            const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const photos = fileUrlPort.generateMany(pet.photos || [], 60 * 24);

            const parents: any[] = [];
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

        const paginationBuilder = new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(filteredPets.length);

        return Object.assign(new PetsListResponseDto(paginationBuilder), {
            availableCount,
            reservedCount,
            adoptedCount,
        });
    }
}
