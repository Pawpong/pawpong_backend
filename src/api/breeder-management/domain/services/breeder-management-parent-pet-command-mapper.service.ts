import { Injectable } from '@nestjs/common';

import type {
    BreederManagementParentPetCreateData,
    BreederManagementParentPetUpdateData,
} from '../../application/ports/breeder-management-pet-command.port';
import type {
    BreederManagementParentPetCreateCommand,
    BreederManagementParentPetUpdateCommand,
} from '../../application/types/breeder-management-pet-command.type';

@Injectable()
export class BreederManagementParentPetCommandMapperService {
    toCreateData(
        userId: string,
        parentPetDto: BreederManagementParentPetCreateCommand,
    ): BreederManagementParentPetCreateData {
        return {
            breederId: userId,
            name: parentPetDto.name,
            breed: parentPetDto.breed,
            gender: parentPetDto.gender,
            birthDate: new Date(parentPetDto.birthDate),
            photoFileName: parentPetDto.photoFileName,
            description: parentPetDto.description || '',
            photos: parentPetDto.photos || [],
            isActive: true,
        };
    }

    toUpdateData(updateData: BreederManagementParentPetUpdateCommand): BreederManagementParentPetUpdateData {
        const updateFields: BreederManagementParentPetUpdateData = {};

        if (updateData.name) updateFields.name = updateData.name;
        if (updateData.breed) updateFields.breed = updateData.breed;
        if (updateData.gender) updateFields.gender = updateData.gender;
        if (updateData.birthDate) updateFields.birthDate = new Date(updateData.birthDate);
        if (updateData.photoFileName) updateFields.photoFileName = updateData.photoFileName;
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        if (updateData.photos !== undefined) updateFields.photos = updateData.photos;

        return updateFields;
    }
}
