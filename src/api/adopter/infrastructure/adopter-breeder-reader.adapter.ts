import { Injectable } from '@nestjs/common';

import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import { AdopterBreederReaderPort } from '../application/ports/adopter-breeder-reader.port';

@Injectable()
export class AdopterBreederReaderAdapter implements AdopterBreederReaderPort {
    constructor(private readonly breederRepository: BreederRepository) {}

    findById(breederId: string) {
        return this.breederRepository.findById(breederId);
    }
}
