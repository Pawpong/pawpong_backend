import { Injectable } from '@nestjs/common';

import type { AdoptionApplicationWriterPort } from '../application/ports/adoption-application-writer.port';
import type { AdoptionApplicationPersistData } from '../application/types/adoption-application.type';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';

@Injectable()
export class AdoptionApplicationWriterMongooseAdapter implements AdoptionApplicationWriterPort {
    constructor(private readonly repository: AdoptionApplicationRepository) {}

    existsOpenApplicationForPet(adopterId: string, petId: string): Promise<boolean> {
        return this.repository.existsOpenApplicationForPet(adopterId, petId);
    }

    async create(data: AdoptionApplicationPersistData): Promise<{ applicationId: string }> {
        const { _id } = await this.repository.create(data);
        return { applicationId: _id };
    }
}
