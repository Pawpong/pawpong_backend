import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { District } from '../../../schema/district.schema';
import { CreateDistrictCommand, UpdateDistrictCommand } from '../admin/application/types/district-command.type';

@Injectable()
export class DistrictRepository {
    constructor(@InjectModel(District.name) private readonly districtModel: Model<District>) {}

    findAll(): Promise<District[]> {
        return this.districtModel.find().exec();
    }

    findAllSorted(): Promise<District[]> {
        return this.districtModel.find().sort({ city: 1 }).exec();
    }

    findById(id: string): Promise<District | null> {
        return this.districtModel.findById(id).exec();
    }

    findByCity(city: string, excludeId?: string): Promise<District | null> {
        return this.districtModel
            .findOne({
                city,
                ...(excludeId ? { _id: { $ne: excludeId } } : {}),
            })
            .exec();
    }

    async create(dto: CreateDistrictCommand): Promise<District> {
        const district = new this.districtModel(dto);
        return district.save();
    }

    update(id: string, dto: UpdateDistrictCommand): Promise<District | null> {
        return this.districtModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: false }).exec();
    }

    async deleteById(id: string): Promise<boolean> {
        const deleted = await this.districtModel.findByIdAndDelete(id).exec();
        return !!deleted;
    }
}
