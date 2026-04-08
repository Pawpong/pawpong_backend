import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';

@Injectable()
export class BreederManagementAdopterRepository {
    constructor(@InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>) {}

    findById(adopterId: string) {
        return this.adopterModel.findById(adopterId).select('emailAddress').lean().exec();
    }
}
