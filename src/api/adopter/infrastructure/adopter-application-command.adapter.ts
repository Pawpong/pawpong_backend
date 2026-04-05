import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';
import type {
    AdopterApplicationCreateCommand,
    AdopterApplicationCreatedRecord,
} from '../application/ports/adopter-application-command.port';
import { AdopterApplicationCommandPort } from '../application/ports/adopter-application-command.port';

@Injectable()
export class AdopterApplicationCommandAdapter extends AdopterApplicationCommandPort {
    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {
        super();
    }

    async findPendingByAdopterAndBreeder(
        adopterId: string,
        breederId: string,
    ): Promise<AdopterApplicationCreatedRecord | null> {
        return (await this.adoptionApplicationModel.findOne({
            adopterId,
            breederId,
            status: 'consultation_pending',
        })) as AdopterApplicationCreatedRecord | null;
    }

    async create(command: AdopterApplicationCreateCommand): Promise<AdopterApplicationCreatedRecord> {
        const application = new this.adoptionApplicationModel(command);
        return (await application.save()) as AdopterApplicationCreatedRecord;
    }
}
