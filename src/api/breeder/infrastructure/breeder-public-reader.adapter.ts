import { Injectable } from '@nestjs/common';
import type {
    BreederPublicBreederRecord,
    BreederPublicPetRecord,
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

        return {
            breeders: breeders as unknown as BreederPublicBreederRecord[],
            total,
        };
    }

    async findPopularPublicBreeders(limit: number): Promise<BreederPublicBreederRecord[]> {
        const breeders = await this.breederPublicRepository.findPopularPublicBreeders(limit);

        return breeders as unknown as BreederPublicBreederRecord[];
    }

    async findPublicBreederById(breederId: string): Promise<BreederPublicBreederRecord | null> {
        const breeder = await this.breederPublicRepository.findPublicBreederById(breederId);

        return (breeder as unknown as BreederPublicBreederRecord | null) || null;
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
        const availablePets = await this.breederPublicRepository.findActiveAvailablePetsByBreederId(breederId);

        return availablePets as unknown as BreederPublicPetRecord[];
    }

    async findActiveParentPetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]> {
        const parentPets = await this.breederPublicRepository.findActiveParentPetsByBreederId(breederId);

        return parentPets as unknown as BreederPublicPetRecord[];
    }

    async findVisibleBreederReviewsByBreederId(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<{ reviews: any[]; total: number }> {
        const [reviews, total] = await this.breederPublicRepository.findVisibleBreederReviewsByBreederId(
            breederId,
            page,
            limit,
        );

        return { reviews, total };
    }
}
