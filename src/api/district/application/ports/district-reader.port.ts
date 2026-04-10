import type { DistrictPublicResult } from '../types/district-result.type';

export const DISTRICT_READER = Symbol('DISTRICT_READER');

export interface DistrictReaderPort {
    readAll(): Promise<DistrictPublicResult[]>;
}
