import { CreateBreedRequestDto } from '../../dto/request/create-breed-request.dto';
import { UpdateBreedRequestDto } from '../../dto/request/update-breed-request.dto';
import { BreedAdminSnapshot } from './breed-admin-reader.port';

export const BREED_WRITER = Symbol('BREED_WRITER');

export interface BreedWriterPort {
    create(dto: CreateBreedRequestDto): Promise<BreedAdminSnapshot>;
    update(id: string, dto: UpdateBreedRequestDto): Promise<BreedAdminSnapshot | null>;
    delete(id: string): Promise<boolean>;
}
