import { Injectable } from '@nestjs/common';

import { CreateBreedRequestDto } from './dto/request/create-breed-request.dto';
import { UpdateBreedRequestDto } from './dto/request/update-breed-request.dto';
import { BreedResponseDto } from '../dto/response/breed-response.dto';
import { CreateBreedUseCase } from './application/use-cases/create-breed.use-case';
import { GetAllBreedsAdminUseCase } from './application/use-cases/get-all-breeds-admin.use-case';
import { GetBreedByIdUseCase } from './application/use-cases/get-breed-by-id.use-case';
import { UpdateBreedUseCase } from './application/use-cases/update-breed.use-case';
import { DeleteBreedUseCase } from './application/use-cases/delete-breed.use-case';

@Injectable()
export class AdminBreedService {
    constructor(
        private readonly createBreedUseCase: CreateBreedUseCase,
        private readonly getAllBreedsAdminUseCase: GetAllBreedsAdminUseCase,
        private readonly getBreedByIdUseCase: GetBreedByIdUseCase,
        private readonly updateBreedUseCase: UpdateBreedUseCase,
        private readonly deleteBreedUseCase: DeleteBreedUseCase,
    ) {}

    /**
     * 품종 카테고리 생성
     */
    async createBreed(dto: CreateBreedRequestDto): Promise<BreedResponseDto> {
        return this.createBreedUseCase.execute(dto);
    }

    /**
     * 모든 품종 카테고리 조회
     */
    async getAllBreeds(): Promise<BreedResponseDto[]> {
        return this.getAllBreedsAdminUseCase.execute();
    }

    /**
     * 특정 품종 카테고리 조회
     */
    async getBreedById(id: string): Promise<BreedResponseDto> {
        return this.getBreedByIdUseCase.execute(id);
    }

    /**
     * 품종 카테고리 수정
     */
    async updateBreed(id: string, dto: UpdateBreedRequestDto): Promise<BreedResponseDto> {
        return this.updateBreedUseCase.execute(id, dto);
    }

    /**
     * 품종 카테고리 삭제
     */
    async deleteBreed(id: string): Promise<void> {
        return this.deleteBreedUseCase.execute(id);
    }
}
