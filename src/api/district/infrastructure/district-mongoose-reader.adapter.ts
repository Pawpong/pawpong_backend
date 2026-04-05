import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { District } from '../../../schema/district.schema';
import { type DistrictReaderPort } from '../application/ports/district-reader.port';
import { GetDistrictsResponseDto } from '../dto/response/get-districts-response.dto';

@Injectable()
export class DistrictMongooseReaderAdapter implements DistrictReaderPort {
    constructor(
        @InjectModel(District.name)
        private readonly districtModel: Model<District>,
    ) {}

    async readAll(): Promise<GetDistrictsResponseDto[]> {
        const districts = await this.districtModel.find().exec();

        return districts.map((district) => ({
            city: district.city,
            districts: district.districts,
        }));
    }
}
