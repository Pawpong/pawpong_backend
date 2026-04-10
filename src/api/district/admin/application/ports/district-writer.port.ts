import { DistrictSnapshot } from './district-admin-reader.port';
import { CreateDistrictCommand, UpdateDistrictCommand } from '../types/district-command.type';

export const DISTRICT_WRITER = Symbol('DISTRICT_WRITER');

export interface DistrictWriterPort {
    create(dto: CreateDistrictCommand): Promise<DistrictSnapshot>;
    update(id: string, dto: UpdateDistrictCommand): Promise<DistrictSnapshot | null>;
    delete(id: string): Promise<boolean>;
}
