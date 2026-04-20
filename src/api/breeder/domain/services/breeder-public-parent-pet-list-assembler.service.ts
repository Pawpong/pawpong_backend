import { Injectable } from '@nestjs/common';

import type { BreederFileUrlPort } from '../../application/ports/breeder-file-url.port';
import type { BreederPublicParentPetRecord } from '../../application/ports/breeder-public-reader.port';

@Injectable()
export class BreederPublicParentPetListAssemblerService {
    build(
        parentPets: BreederPublicParentPetRecord[],
        page: number | undefined,
        limit: number | undefined,
        fileUrlPort: BreederFileUrlPort,
    ) {
        const currentPage = page && page > 0 ? page : 1;
        const itemsPerPage = limit && limit > 0 ? limit : 0;
        const skip = itemsPerPage > 0 ? (currentPage - 1) * itemsPerPage : 0;
        const pagedParentPets = itemsPerPage > 0 ? parentPets.slice(skip, skip + itemsPerPage) : parentPets;

        const items = pagedParentPets.map((pet) => ({
            petId: pet._id.toString(),
            name: pet.name,
            breed: pet.breed,
            gender: pet.gender,
            birthDate: pet.birthDate,
            photoUrl: fileUrlPort.generateOneSafe(pet.photoFileName, 60 * 24) || '',
            photos: fileUrlPort.generateMany(pet.photos || [], 60 * 24),
            healthRecords: pet.healthRecords || [],
            description: pet.description || '',
        }));

        const totalCount = parentPets.length;
        const totalPages = itemsPerPage > 0 ? Math.ceil(totalCount / itemsPerPage) : 1;
        const hasNextPage = itemsPerPage > 0 && currentPage < totalPages;
        const hasPrevPage = currentPage > 1;

        return {
            items,
            pagination:
                itemsPerPage > 0
                    ? {
                          currentPage,
                          totalPages,
                          totalCount,
                          hasNextPage,
                          hasPrevPage,
                      }
                    : undefined,
        };
    }
}
