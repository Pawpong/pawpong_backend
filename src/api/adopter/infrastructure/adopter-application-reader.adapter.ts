import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';
import { type AdopterApplicationReaderPort, type AdopterApplicationRecord } from '../application/ports/adopter-application-reader.port';

@Injectable()
export class AdopterApplicationReaderAdapter implements AdopterApplicationReaderPort {
    constructor(
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<BreederDocument>,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    async findBreederIdsByAnimalType(animalType: 'cat' | 'dog'): Promise<string[]> {
        const breeders = await this.breederModel
            .find({
                'profile.specialization': animalType,
            })
            .select('_id')
            .exec();

        return breeders.map((breeder: any) => breeder._id.toString());
    }

    countByAdopterId(adopterId: string, breederIds?: string[]): Promise<number> {
        return this.adoptionApplicationModel.countDocuments(this.buildQuery(adopterId, breederIds)).exec();
    }

    findPagedByAdopterId(
        adopterId: string,
        page: number,
        limit: number,
        breederIds?: string[],
    ): Promise<AdopterApplicationRecord[]> {
        return this.adoptionApplicationModel
            .find(this.buildQuery(adopterId, breederIds))
            .sort({ appliedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec() as Promise<AdopterApplicationRecord[]>;
    }

    findByIdForAdopter(adopterId: string, applicationId: string): Promise<AdopterApplicationRecord | null> {
        return this.adoptionApplicationModel.findOne({
            _id: applicationId,
            adopterId,
        }) as Promise<AdopterApplicationRecord | null>;
    }

    private buildQuery(adopterId: string, breederIds?: string[]): Record<string, any> {
        const query: Record<string, any> = { adopterId };
        if (breederIds) {
            query.breederId = { $in: breederIds };
        }
        return query;
    }
}
