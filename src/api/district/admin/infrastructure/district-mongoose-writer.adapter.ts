import { Injectable } from '@nestjs/common';

import { CreateDistrictRequestDto } from '../../../breeder-management/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from '../../../breeder-management/request/update-district-request.dto';
import { DistrictSnapshot } from '../application/ports/district-admin-reader.port';
import { DistrictWriterPort } from '../application/ports/district-writer.port';
import { DistrictRepository } from '../../repository/district.repository';

@Injectable()
export class DistrictMongooseWriterAdapter implements DistrictWriterPort {
    constructor(private readonly districtRepository: DistrictRepository) {}

    async create(dto: CreateDistrictRequestDto): Promise<DistrictSnapshot> {
        const saved = await this.districtRepository.create(dto);
        return this.toSnapshot(saved);
    }

    async update(id: string, dto: UpdateDistrictRequestDto): Promise<DistrictSnapshot | null> {
        const updated = await this.districtRepository.update(id, dto);
        return updated ? this.toSnapshot(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        return this.districtRepository.deleteById(id);
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
