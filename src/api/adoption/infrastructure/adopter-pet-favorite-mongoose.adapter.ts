import { Injectable } from '@nestjs/common';

import {
    AdopterPetFavoriteReaderPort,
    AdopterPetFavoriteWriterPort,
} from '../application/ports/adopter-pet-favorite.port';
import { AdopterPetFavoriteRepository } from '../repository/adopter-pet-favorite.repository';

@Injectable()
export class AdopterPetFavoriteMongooseAdapter
    implements AdopterPetFavoriteReaderPort, AdopterPetFavoriteWriterPort
{
    constructor(private readonly repository: AdopterPetFavoriteRepository) {}

    isFavorited(adopterId: string, petId: string): Promise<boolean> {
        return this.repository.exists(adopterId, petId);
    }

    findFavoritedPetIds(adopterId: string, petIds: string[]): Promise<Set<string>> {
        return this.repository.findFavoritedPetIds(adopterId, petIds);
    }

    add(adopterId: string, petId: string): Promise<boolean> {
        return this.repository.add(adopterId, petId);
    }

    remove(adopterId: string, petId: string): Promise<boolean> {
        return this.repository.remove(adopterId, petId);
    }
}
