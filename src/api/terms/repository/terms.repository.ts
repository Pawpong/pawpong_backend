import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Terms, TermsCode } from '../../../schema/terms.schema';

@Injectable()
export class TermsRepository {
    constructor(@InjectModel(Terms.name) private readonly termsModel: Model<Terms>) {}

    findActiveAll(): Promise<Terms[]> {
        return this.termsModel.find({ isActive: true }).sort({ isRequired: -1, code: 1 }).exec();
    }

    findActiveByCode(code: TermsCode): Promise<Terms | null> {
        return this.termsModel.findOne({ code, isActive: true }).exec();
    }
}
