import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Terms, TermsCode } from '../../../../schema/terms.schema';
import type { TermsCreateCommand, TermsUpdateCommand } from '../../../admin/terms/application/types/terms-command.type';

@Injectable()
export class TermsRepository {
    constructor(@InjectModel(Terms.name) private readonly termsModel: Model<Terms>) {}

    findActiveAll(): Promise<Terms[]> {
        return this.termsModel.find({ isActive: true }).sort({ isRequired: -1, code: 1 }).exec();
    }

    findActiveByCode(code: TermsCode): Promise<Terms | null> {
        return this.termsModel.findOne({ code, isActive: true }).exec();
    }

    findAll(): Promise<Terms[]> {
        return this.termsModel.find().sort({ code: 1, createdAt: -1 }).exec();
    }

    findById(termsId: string): Promise<Terms | null> {
        return this.termsModel.findById(termsId).exec();
    }

    /** code+version 은 유니크 인덱스라 생성 전 중복 확인에 쓴다 */
    findByCodeAndVersion(code: TermsCode, version: string): Promise<Terms | null> {
        return this.termsModel.findOne({ code, version }).exec();
    }

    async create(createData: TermsCreateCommand): Promise<Terms> {
        const terms = new this.termsModel({
            code: createData.code,
            version: createData.version,
            title: createData.title,
            body: createData.body,
            isRequired: createData.isRequired ?? true,
            isActive: false,
        });

        return terms.save();
    }

    async update(termsId: string, updateData: TermsUpdateCommand): Promise<Terms | null> {
        const terms = await this.termsModel.findById(termsId).exec();

        if (!terms) {
            return null;
        }

        if (updateData.title !== undefined) terms.title = updateData.title;
        if (updateData.body !== undefined) terms.body = updateData.body;
        if (updateData.isRequired !== undefined) terms.isRequired = updateData.isRequired;

        return terms.save();
    }

    /** 같은 code 의 기존 활성 버전을 비활성화하고 이 버전을 활성화한다 (코드당 활성 버전은 1개) */
    async activate(termsId: string): Promise<Terms | null> {
        const terms = await this.termsModel.findById(termsId).exec();

        if (!terms) {
            return null;
        }

        await this.termsModel.updateMany({ code: terms.code, _id: { $ne: terms._id } }, { isActive: false }).exec();

        terms.isActive = true;
        terms.activatedAt = new Date();

        return terms.save();
    }

    async deleteById(termsId: string): Promise<boolean> {
        const deleted = await this.termsModel.findByIdAndDelete(termsId).exec();
        return !!deleted;
    }
}
