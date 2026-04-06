import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { District } from '../../../../schema/district.schema';
import { DistrictAdminReaderPort, DistrictSnapshot } from '../application/ports/district-admin-reader.port';

@Injectable()
export class DistrictMongooseAdminReaderAdapter implements DistrictAdminReaderPort {
    constructor(@InjectModel(District.name) private readonly districtModel: Model<District>) {}

    async readAll(): Promise<DistrictSnapshot[]> {
        const districts = await this.districtModel.find().sort({ city: 1 }).lean().exec();
        return districts.map((district) => this.toSnapshot(district));
    }

    async findById(id: string): Promise<DistrictSnapshot | null> {
        const district = await this.districtModel.findById(id).lean().exec();
        return district ? this.toSnapshot(district) : null;
    }

    async findByCity(city: string, excludeId?: string): Promise<DistrictSnapshot | null> {
        const district = await this.districtModel
            .findOne({
                city,
                ...(excludeId ? { _id: { $ne: excludeId } } : {}),
            })
            .lean()
            .exec();

        return district ? this.toSnapshot(district) : null;
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
