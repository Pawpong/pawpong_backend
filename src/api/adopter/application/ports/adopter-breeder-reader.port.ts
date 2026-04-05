export const ADOPTER_BREEDER_READER_PORT = Symbol('ADOPTER_BREEDER_READER_PORT');

export interface AdopterBreederReaderPort {
    findById(breederId: string): Promise<any | null>;
}
