import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';

export const ADOPTER_BREEDER_READER_PORT = Symbol('ADOPTER_BREEDER_READER_PORT');

export interface AdopterBreederReaderPort {
    findById(breederId: string): Promise<AdopterBreederRecord | null>;
}
