import { CreateDistrictRequestDto } from '../../../../breeder-management/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from '../../../../breeder-management/request/update-district-request.dto';
import { DistrictSnapshot } from './district-admin-reader.port';

export const DISTRICT_WRITER = Symbol('DISTRICT_WRITER');

export interface DistrictWriterPort {
    create(dto: CreateDistrictRequestDto): Promise<DistrictSnapshot>;
    update(id: string, dto: UpdateDistrictRequestDto): Promise<DistrictSnapshot | null>;
    delete(id: string): Promise<boolean>;
}
