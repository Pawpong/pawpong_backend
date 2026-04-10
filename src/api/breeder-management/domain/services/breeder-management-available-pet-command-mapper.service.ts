import { Injectable } from '@nestjs/common';

import { PetStatus } from '../../../../common/enum/user.enum';
import type {
    BreederManagementAvailablePetCreateData,
    BreederManagementAvailablePetUpdateData,
} from '../../application/ports/breeder-management-pet-command.port';
import type {
    BreederManagementAvailablePetCreateCommand,
    BreederManagementAvailablePetUpdateCommand,
} from '../../application/types/breeder-management-pet-command.type';

@Injectable()
export class BreederManagementAvailablePetCommandMapperService {
    toCreateData(
        userId: string,
        availablePetDto: BreederManagementAvailablePetCreateCommand,
    ): BreederManagementAvailablePetCreateData {
        return {
            breederId: userId,
            name: availablePetDto.name,
            breed: availablePetDto.breed,
            gender: availablePetDto.gender,
            birthDate: new Date(availablePetDto.birthDate),
            price: availablePetDto.price,
            status: PetStatus.AVAILABLE,
            photos: availablePetDto.photos || [],
            description: availablePetDto.description || '',
            parentInfo: availablePetDto.parentInfo
                ? {
                      mother: availablePetDto.parentInfo.mother,
                      father: availablePetDto.parentInfo.father,
                  }
                : undefined,
        };
    }

    toUpdateData(updateData: BreederManagementAvailablePetUpdateCommand): BreederManagementAvailablePetUpdateData {
        const updateFields: BreederManagementAvailablePetUpdateData = {};

        if (updateData.name) updateFields.name = updateData.name;
        if (updateData.breed) updateFields.breed = updateData.breed;
        if (updateData.gender) updateFields.gender = updateData.gender;
        if (updateData.birthDate) updateFields.birthDate = new Date(updateData.birthDate);
        if (updateData.price) updateFields.price = updateData.price;
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        if (updateData.photos !== undefined) updateFields.photos = updateData.photos;
        if (updateData.parentInfo) {
            updateFields.parentInfo = {
                mother: updateData.parentInfo.mother,
                father: updateData.parentInfo.father,
            };
        }

        return updateFields;
    }
}
