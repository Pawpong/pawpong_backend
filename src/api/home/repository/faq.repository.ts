import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Faq, FaqDocument } from '../../../schema/faq.schema';
import type { HomeFaqCommand, HomeFaqUpdateCommand } from '../admin/application/types/home-admin-command.type';

@Injectable()
export class FaqRepository {
    constructor(@InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>) {}

    findActiveForUserTypes(userTypes: string[]): Promise<FaqDocument[]> {
        return this.faqModel
            .find({
                isActive: true,
                userType: { $in: userTypes },
            })
            .sort({ order: 1 })
            .exec();
    }

    findAllOrdered(): Promise<FaqDocument[]> {
        return this.faqModel.find().sort({ order: 1 }).exec();
    }

    create(data: HomeFaqCommand): Promise<FaqDocument> {
        return this.faqModel.create(data);
    }

    update(faqId: string, data: HomeFaqUpdateCommand): Promise<FaqDocument | null> {
        return this.faqModel.findByIdAndUpdate(faqId, data, { new: true }).exec();
    }

    async deleteById(faqId: string): Promise<boolean> {
        const result = await this.faqModel.findByIdAndDelete(faqId).exec();
        return !!result;
    }
}
