import { Injectable } from '@nestjs/common';

import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederSearchResponseDto } from './dto/response/breeder-search-response.dto';
import { BreederProfileResponseDto } from './dto/response/breeder-profile-response.dto';
import { SearchBreedersUseCase } from './application/use-cases/search-breeders.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetBreederReviewsUseCase } from './application/use-cases/get-breeder-reviews.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederApplicationFormUseCase } from './application/use-cases/get-breeder-application-form.use-case';

@Injectable()
export class BreederService {
    constructor(
        private readonly searchBreedersUseCase: SearchBreedersUseCase,
        private readonly getBreederProfileUseCase: GetBreederProfileUseCase,
        private readonly getBreederReviewsUseCase: GetBreederReviewsUseCase,
        private readonly getBreederPetsUseCase: GetBreederPetsUseCase,
        private readonly getBreederPetDetailUseCase: GetBreederPetDetailUseCase,
        private readonly getBreederParentPetsUseCase: GetBreederParentPetsUseCase,
        private readonly getBreederApplicationFormUseCase: GetBreederApplicationFormUseCase,
    ) {}

    async searchBreeders(searchDto: BreederSearchRequestDto): Promise<BreederSearchResponseDto> {
        return this.searchBreedersUseCase.execute(searchDto);
    }

    async getBreederProfile(breederId: string, userId?: string): Promise<BreederProfileResponseDto> {
        return this.getBreederProfileUseCase.execute(breederId, userId);
    }

    async getBreederReviews(breederId: string, page: number = 1, limit: number = 10): Promise<any> {
        return this.getBreederReviewsUseCase.execute(breederId, page, limit);
    }

    async getPetDetail(breederId: string, petId: string): Promise<any> {
        return this.getBreederPetDetailUseCase.execute(breederId, petId);
    }

    async getParentPets(breederId: string, page?: number, limit?: number): Promise<any> {
        return this.getBreederParentPetsUseCase.execute(breederId, page, limit);
    }

    async getBreederPets(breederId: string, status?: string, page: number = 1, limit: number = 20): Promise<any> {
        return this.getBreederPetsUseCase.execute(breederId, status, page, limit);
    }

    async getApplicationForm(breederId: string): Promise<any> {
        return this.getBreederApplicationFormUseCase.execute(breederId);
    }
}
