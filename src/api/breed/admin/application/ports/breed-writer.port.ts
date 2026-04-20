import { BreedAdminSnapshot } from './breed-admin-reader.port';
import { type CreateBreedCommand, type UpdateBreedCommand } from '../types/breed-command.type';

export const BREED_WRITER_PORT = Symbol('BREED_WRITER_PORT');

export interface BreedWriterPort {
    create(dto: CreateBreedCommand): Promise<BreedAdminSnapshot>;
    update(id: string, dto: UpdateBreedCommand): Promise<BreedAdminSnapshot | null>;
    delete(id: string): Promise<boolean>;
}
