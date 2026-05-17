import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import type { JwtUserStatusPort } from '../ports/jwt-user-status.port';

@Injectable()
export class JwtUserStatusMongooseAdapter implements JwtUserStatusPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async findAccountStatus(userId: string, role: 'adopter' | 'breeder'): Promise<string | undefined> {
        if (role === 'adopter') {
            const adopter = await this.adopterModel.findById(userId).select('accountStatus').lean().exec();
            return adopter?.accountStatus;
        }
        const breeder = await this.breederModel.findById(userId).select('accountStatus').lean().exec();
        return breeder?.accountStatus;
    }
}
