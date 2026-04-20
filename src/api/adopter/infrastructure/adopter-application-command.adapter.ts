import { Injectable } from '@nestjs/common';
import type {
    AdopterApplicationCreateCommand,
    AdopterApplicationCreatedRecord,
} from '../application/ports/adopter-application-command.port';
import type { AdopterApplicationCommandPort } from '../application/ports/adopter-application-command.port';
import { AdopterApplicationRepository } from '../repository/adopter-application.repository';

@Injectable()
export class AdopterApplicationCommandAdapter implements AdopterApplicationCommandPort {
    constructor(private readonly adopterApplicationRepository: AdopterApplicationRepository) {}

    async findPendingByAdopterAndBreeder(
        adopterId: string,
        breederId: string,
    ): Promise<AdopterApplicationCreatedRecord | null> {
        return (await this.adopterApplicationRepository.findPendingByAdopterAndBreeder(
            adopterId,
            breederId,
        )) as AdopterApplicationCreatedRecord | null;
    }

    async create(command: AdopterApplicationCreateCommand): Promise<AdopterApplicationCreatedRecord> {
        return (await this.adopterApplicationRepository.create(command)) as AdopterApplicationCreatedRecord;
    }
}
