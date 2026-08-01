import { Injectable } from '@nestjs/common';

import { AvailablePetManagementRepository } from '../../breeder-management/repository/available-pet-management.repository';
import type { AdopterPetReaderPort } from '../application/ports/adopter-pet-reader.port';

@Injectable()
export class AdopterPetReaderAdapter implements AdopterPetReaderPort {
    constructor(private readonly availablePetManagementRepository: AvailablePetManagementRepository) {}

    findByIdAndBreeder(petId: string, breederId: string) {
        return this.availablePetManagementRepository.findByIdAndBreeder(petId, breederId);
    }
}
