import { Injectable } from '@nestjs/common';

import { District } from '../../../../schema/district.schema';
import { DistrictSnapshot } from '../application/ports/district-admin-reader.port';
import { DistrictWriterPort } from '../application/ports/district-writer.port';
import { CreateDistrictCommand, UpdateDistrictCommand } from '../application/types/district-command.type';
import { DistrictRepository } from '../../repository/district.repository';

@Injectable()
export class DistrictMongooseWriterAdapter implements DistrictWriterPort {
    constructor(private readonly districtRepository: DistrictRepository) {}

    async create(dto: CreateDistrictCommand): Promise<DistrictSnapshot> {
        const saved = await this.districtRepository.create(dto);
        return this.toSnapshot(saved);
    }

    async update(id: string, dto: UpdateDistrictCommand): Promise<DistrictSnapshot | null> {
        const updated = await this.districtRepository.update(id, dto);
        return updated ? this.toSnapshot(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        return this.districtRepository.deleteById(id);
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
