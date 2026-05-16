import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AlimtalkTemplate, AlimtalkTemplateDocument } from '../../../schema/alimtalk-template.schema';

@Injectable()
export class AlimtalkTemplateRepository {
    constructor(
        @InjectModel(AlimtalkTemplate.name)
        private readonly model: Model<AlimtalkTemplateDocument>,
    ) {}

    findAllActive() {
        return this.model.find({ isActive: true }).lean().exec();
    }

    findActiveByCode(templateCode: string) {
        return this.model.findOne({ templateCode, isActive: true }).lean().exec();
    }
}
