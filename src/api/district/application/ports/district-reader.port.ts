import { GetDistrictsResponseDto } from '../../dto/response/get-districts-response.dto';

export const DISTRICT_READER = Symbol('DISTRICT_READER');

export interface DistrictReaderPort {
    readAll(): Promise<GetDistrictsResponseDto[]>;
}
