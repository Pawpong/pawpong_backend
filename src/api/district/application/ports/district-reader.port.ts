import type { DistrictPublicResult } from '../types/district-result.type';

export const DISTRICT_READER_PORT = Symbol('DISTRICT_READER_PORT');

export interface DistrictReaderPort {
    readAll(): Promise<DistrictPublicResult[]>;
}
