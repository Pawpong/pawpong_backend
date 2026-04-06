import { Injectable } from '@nestjs/common';

import { CreateDistrictRequestDto } from '../../breeder-management/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from '../../breeder-management/request/update-district-request.dto';
import { DistrictResponseDto } from '../dto/response/district-response.dto';
import { CreateDistrictUseCase } from './application/use-cases/create-district.use-case';
import { GetAllDistrictsAdminUseCase } from './application/use-cases/get-all-districts-admin.use-case';
import { GetDistrictByIdAdminUseCase } from './application/use-cases/get-district-by-id-admin.use-case';
import { UpdateDistrictUseCase } from './application/use-cases/update-district.use-case';
import { DeleteDistrictUseCase } from './application/use-cases/delete-district.use-case';

@Injectable()
export class DistrictAdminService {
    constructor(
        private readonly createDistrictUseCase: CreateDistrictUseCase,
        private readonly getAllDistrictsAdminUseCase: GetAllDistrictsAdminUseCase,
        private readonly getDistrictByIdAdminUseCase: GetDistrictByIdAdminUseCase,
        private readonly updateDistrictUseCase: UpdateDistrictUseCase,
        private readonly deleteDistrictUseCase: DeleteDistrictUseCase,
    ) {}

    /**
     * 지역 생성
     */
    async createDistrict(dto: CreateDistrictRequestDto): Promise<DistrictResponseDto> {
        return this.createDistrictUseCase.execute(dto);
    }

    /**
     * 모든 지역 조회
     */
    async getAllDistricts(): Promise<DistrictResponseDto[]> {
        return this.getAllDistrictsAdminUseCase.execute();
    }

    /**
     * 특정 지역 조회
     */
    async getDistrictById(id: string): Promise<DistrictResponseDto> {
        return this.getDistrictByIdAdminUseCase.execute(id);
    }

    /**
     * 지역 수정
     */
    async updateDistrict(id: string, dto: UpdateDistrictRequestDto): Promise<DistrictResponseDto> {
        return this.updateDistrictUseCase.execute(id, dto);
    }

    /**
     * 지역 삭제
     */
    async deleteDistrict(id: string): Promise<void> {
        return this.deleteDistrictUseCase.execute(id);
    }
}
