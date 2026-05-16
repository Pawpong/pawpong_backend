import { Injectable } from '@nestjs/common';

import { AdoptionPetWriterPort } from '../application/ports/adoption-pet-writer.port';
import { AdoptionPetRepository } from '../repository/adoption-pet.repository';

@Injectable()
export class AdoptionPetMongooseWriterAdapter implements AdoptionPetWriterPort {
    constructor(private readonly repository: AdoptionPetRepository) {}

    incrementViewCount(petId: string): Promise<number | null> {
        return this.repository.incrementViewCount(petId);
    }
}
