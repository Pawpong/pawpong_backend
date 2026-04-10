import { Injectable } from '@nestjs/common';
import type {
    BreederPublicBreederRecord,
    BreederPublicParentPetRecord,
    BreederPublicPetRecord,
    BreederPublicReviewRecord,
    BreederPublicReaderPort,
} from '../application/ports/breeder-public-reader.port';
import { BreederPublicRepository } from '../repository/breeder-public.repository';

@Injectable()
export class BreederPublicReaderAdapter implements BreederPublicReaderPort {
    constructor(private readonly breederPublicRepository: BreederPublicRepository) {}

    async searchPublicBreeders(
        filter: Record<string, unknown>,
        sortOrder: Record<string, 1 | -1>,
        page: number,
        limit: number,
    ): Promise<{ breeders: BreederPublicBreederRecord[]; total: number }> {
        const [breeders, total] = await this.breederPublicRepository.searchPublicBreeders(filter, sortOrder, page, limit);

        return { breeders, total };
    }

    async findPopularPublicBreeders(limit: number): Promise<BreederPublicBreederRecord[]> {
        return this.breederPublicRepository.findPopularPublicBreeders(limit);
    }

    async findPublicBreederById(breederId: string): Promise<BreederPublicBreederRecord | null> {
        return this.breederPublicRepository.findPublicBreederById(breederId);
    }

    async findAdopterFavoriteBreederIds(userId: string): Promise<string[] | null> {
        return this.breederPublicRepository.findAdopterFavoriteBreederIds(userId);
    }

    async findBreederFavoriteBreederIds(userId: string): Promise<string[] | null> {
        return this.breederPublicRepository.findBreederFavoriteBreederIds(userId);
    }

    async findBreederIdsWithAvailablePets(): Promise<string[]> {
        return this.breederPublicRepository.findBreederIdsWithAvailablePets();
    }

    async incrementProfileViews(breederId: string): Promise<void> {
        await this.breederPublicRepository.incrementProfileViews(breederId);
    }

    async findActiveAvailablePetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]> {
        return this.breederPublicRepository.findActiveAvailablePetsByBreederId(breederId);
    }

    async findActiveParentPetsByBreederId(breederId: string): Promise<BreederPublicParentPetRecord[]> {
        return this.breederPublicRepository.findActiveParentPetsByBreederId(breederId);
    }

    async findVisibleBreederReviewsByBreederId(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<{ reviews: BreederPublicReviewRecord[]; total: number }> {
        const [reviews, total] = await this.breederPublicRepository.findVisibleBreederReviewsByBreederId(
            breederId,
            page,
            limit,
        );

        return { reviews, total };
    }
}
