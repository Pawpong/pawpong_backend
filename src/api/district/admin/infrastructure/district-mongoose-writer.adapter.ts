import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { District } from '../../../../schema/district.schema';
import { CreateDistrictRequestDto } from '../../../breeder-management/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from '../../../breeder-management/request/update-district-request.dto';
import { DistrictSnapshot } from '../application/ports/district-admin-reader.port';
import { DistrictWriterPort } from '../application/ports/district-writer.port';

@Injectable()
export class DistrictMongooseWriterAdapter implements DistrictWriterPort {
    constructor(@InjectModel(District.name) private readonly districtModel: Model<District>) {}

    async create(dto: CreateDistrictRequestDto): Promise<DistrictSnapshot> {
        const district = new this.districtModel(dto);
        const saved = await district.save();
        return this.toSnapshot(saved);
    }

    async update(id: string, dto: UpdateDistrictRequestDto): Promise<DistrictSnapshot | null> {
        const updated = await this.districtModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: false })
            .exec();

        return updated ? this.toSnapshot(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await this.districtModel.findByIdAndDelete(id).exec();
        return !!deleted;
    }

    private toSnapshot(district: any): DistrictSnapshot {
        return {
            id: district._id.toString(),
            city: district.city,
            districts: district.districts,
            createdAt: district.createdAt,
            updatedAt: district.updatedAt,
        };
    }
}
