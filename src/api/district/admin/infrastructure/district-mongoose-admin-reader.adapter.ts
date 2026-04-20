import { Injectable } from '@nestjs/common';

import { DistrictAdminReaderPort, DistrictSnapshot } from '../application/ports/district-admin-reader.port';
import { DistrictRepository } from '../../repository/district.repository';
import { District } from '../../../../schema/district.schema';

@Injectable()
export class DistrictMongooseAdminReaderAdapter implements DistrictAdminReaderPort {
    constructor(private readonly districtRepository: DistrictRepository) {}

    async readAll(): Promise<DistrictSnapshot[]> {
        const districts = await this.districtRepository.findAllSorted();
        return districts.map((district) => this.toSnapshot(district));
    }

    async findById(id: string): Promise<DistrictSnapshot | null> {
        const district = await this.districtRepository.findById(id);
        return district ? this.toSnapshot(district) : null;
    }

    async findByCity(city: string, excludeId?: string): Promise<DistrictSnapshot | null> {
        const district = await this.districtRepository.findByCity(city, excludeId);
        return district ? this.toSnapshot(district) : null;
    }

    private toSnapshot(district: District): DistrictSnapshot {
        return {
            id: district._id.toString(),
            city: district.city,
            districts: district.districts,
            createdAt: district.createdAt,
            updatedAt: district.updatedAt,
        };
    }
}
