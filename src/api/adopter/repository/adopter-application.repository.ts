import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import {
    AdoptionApplication,
    AdoptionApplicationDocument,
} from '../../../schema/adoption-application.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import type { AdopterApplicationCreateCommand } from '../application/ports/adopter-application-command.port';
import type { AdopterObjectIdLike } from '../types/adopter-application.type';

@Injectable()
export class AdopterApplicationRepository {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    findPendingByAdopterAndBreeder(adopterId: string, breederId: string) {
        return this.adoptionApplicationModel.findOne({
            adopterId,
            breederId,
            status: 'consultation_pending',
        });
    }

    async create(command: AdopterApplicationCreateCommand) {
        const application = new this.adoptionApplicationModel(command);
        return application.save();
    }

    async findBreederIdsByAnimalType(animalType: 'cat' | 'dog'): Promise<string[]> {
        const breeders = await this.breederModel
            .find({
                'profile.specialization': animalType,
            })
            .select('_id')
            .exec();

        return breeders.map((breeder) => (breeder._id as AdopterObjectIdLike).toString());
    }

    countByAdopterId(adopterId: string, breederIds?: string[]): Promise<number> {
        return this.adoptionApplicationModel.countDocuments(this.buildQuery(adopterId, breederIds)).exec();
    }

    findPagedByAdopterId(adopterId: string, page: number, limit: number, breederIds?: string[]) {
        return this.adoptionApplicationModel
            .find(this.buildQuery(adopterId, breederIds))
            .sort({ appliedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }

    findByIdForAdopter(adopterId: string, applicationId: string) {
        if (!Types.ObjectId.isValid(applicationId)) {
            return Promise.resolve(null);
        }
        return this.adoptionApplicationModel.findOne({
            _id: applicationId,
            adopterId,
        });
    }

    private buildQuery(adopterId: string, breederIds?: string[]): FilterQuery<AdoptionApplicationDocument> {
        const query: FilterQuery<AdoptionApplicationDocument> = { adopterId };
        if (breederIds) {
            query.breederId = { $in: breederIds };
        }
        return query;
    }
}
