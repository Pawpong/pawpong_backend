import type { BreederPetPostingCreatePersistData } from '../types/breeder-pet-posting-command.type';

export const BREEDER_PET_POSTING_WRITER_PORT = Symbol('BREEDER_PET_POSTING_WRITER_PORT');

export interface BreederPetPostingWriterPort {
    create(data: BreederPetPostingCreatePersistData): Promise<{ petId: string }>;
}
