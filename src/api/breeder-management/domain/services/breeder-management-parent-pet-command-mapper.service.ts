import { Injectable } from '@nestjs/common';

import { ParentPetAddDto } from '../../dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from '../../dto/request/parent-pet-update-request.dto';
import type {
    BreederManagementParentPetCreateData,
    BreederManagementParentPetUpdateData,
} from '../../application/ports/breeder-management-pet-command.port';

@Injectable()
export class BreederManagementParentPetCommandMapperService {
    toCreateData(userId: string, parentPetDto: ParentPetAddDto): BreederManagementParentPetCreateData {
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

    toUpdateData(updateData: ParentPetUpdateDto): BreederManagementParentPetUpdateData {
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
