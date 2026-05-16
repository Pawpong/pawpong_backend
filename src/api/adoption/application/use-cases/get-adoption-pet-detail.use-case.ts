import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AdoptionPetMapperService } from '../../domain/services/adoption-pet-mapper.service';
import {
    ADOPTER_PET_FAVORITE_READER_PORT,
    type AdopterPetFavoriteReaderPort,
} from '../ports/adopter-pet-favorite.port';
import { ADOPTION_ASSET_URL_PORT, type AdoptionAssetUrlPort } from '../ports/adoption-asset-url.port';
import {
    ADOPTION_BREEDER_SUMMARY_PORT,
    type AdoptionBreederSummary,
    type AdoptionBreederSummaryPort,
} from '../ports/adoption-breeder-summary.port';
import { ADOPTION_PET_READER_PORT, type AdoptionPetReaderPort } from '../ports/adoption-pet-reader.port';
import { ADOPTION_PET_WRITER_PORT, type AdoptionPetWriterPort } from '../ports/adoption-pet-writer.port';
import type { AdoptionPetDetailResult } from '../types/adoption-result.type';

@Injectable()
export class GetAdoptionPetDetailUseCase {
    constructor(
        @Inject(ADOPTION_PET_READER_PORT)
        private readonly petReader: AdoptionPetReaderPort,
        @Inject(ADOPTION_PET_WRITER_PORT)
        private readonly petWriter: AdoptionPetWriterPort,
        @Inject(ADOPTER_PET_FAVORITE_READER_PORT)
        private readonly favoriteReader: AdopterPetFavoriteReaderPort,
        @Inject(ADOPTION_ASSET_URL_PORT)
        private readonly assetUrlPort: AdoptionAssetUrlPort,
        @Inject(ADOPTION_BREEDER_SUMMARY_PORT)
        private readonly breederSummaryPort: AdoptionBreederSummaryPort,
        private readonly mapper: AdoptionPetMapperService,
    ) {}

    async execute(input: { petId: string; adopterId?: string }): Promise<AdoptionPetDetailResult> {
        const detail = await this.petReader.readByIdDetailed(input.petId);
        if (!detail) {
            throw new BadRequestException('해당 동물을 찾을 수 없습니다.');
        }

        // 상세 진입 시 viewCount 원자 증가 (incrementViewCount 가 새 값 반환)
        const newViewCount = await this.petWriter.incrementViewCount(input.petId);
        const effectiveViewCount = newViewCount ?? detail.viewCount;

        const [photoUrls, parents, environmentPhotoUrl, breederSummary, favoritedSet] = await Promise.all([
            Promise.all(detail.photos.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName))),
            this.resolveParentPhotos(detail.parentPetSnapshots),
            detail.breedingEnvironment?.photoFileName
                ? this.assetUrlPort.generateSignedUrl(detail.breedingEnvironment.photoFileName)
                : Promise.resolve<string | undefined>(undefined),
            this.breederSummaryPort.readSummary(detail.breederId),
            input.adopterId
                ? this.favoriteReader.findFavoritedPetIds(input.adopterId, [detail.id])
                : Promise.resolve(new Set<string>()),
        ]);

        const isFavorited = favoritedSet.has(detail.id);

        const baseCard = this.mapper.toItem({ ...detail, viewCount: effectiveViewCount }, photoUrls, isFavorited);

        const breederBlock = await this.toBreederBlock(detail.breederId, breederSummary);

        return {
            ...baseCard,
            description: detail.description,
            tags: detail.tags ?? [],
            birthDate: detail.birthDate.toISOString(),
            vaccinationStatus: detail.vaccinationStatus,
            vaccinationRecords: (detail.vaccinationRecords ?? []).map((record) => ({
                name: record.name,
                date: record.date.toISOString(),
                round: record.round,
            })),
            vaccinationIncompleteReason: detail.vaccinationIncompleteReason,
            geneticTestStatus: detail.geneticTestStatus,
            geneticTestRecords: (detail.geneticTestRecords ?? []).map((record) => ({
                date: record.date.toISOString(),
                institution: record.institution,
                testName: record.testName,
                result: record.result,
            })),
            geneticTestIncompleteReason: detail.geneticTestIncompleteReason,
            parents,
            breedingEnvironment: detail.breedingEnvironment
                ? {
                      description: detail.breedingEnvironment.description,
                      photoUrl: environmentPhotoUrl,
                  }
                : undefined,
            breeder: breederBlock,
        };
    }

    private async resolveParentPhotos(
        parents: Array<{
            relation: 'mother' | 'father';
            breed: string;
            name: string;
            birthDate?: Date;
            photoFileName?: string;
        }> = [],
    ): Promise<AdoptionPetDetailResult['parents']> {
        return Promise.all(
            parents.map(async (parent) => ({
                relation: parent.relation,
                breed: parent.breed,
                name: parent.name,
                birthDate: parent.birthDate ? parent.birthDate.toISOString() : undefined,
                photoUrl: parent.photoFileName
                    ? await this.assetUrlPort.generateSignedUrl(parent.photoFileName)
                    : undefined,
            })),
        );
    }

    private async toBreederBlock(
        breederId: string,
        summary: AdoptionBreederSummary | null,
    ): Promise<AdoptionPetDetailResult['breeder']> {
        if (!summary) {
            return {
                breederId,
                displayName: '',
                profileImageUrl: undefined,
                locationText: undefined,
                bpm: 0,
            };
        }
        const profileImageUrl = summary.profileImageFileName
            ? await this.assetUrlPort.generateSignedUrl(summary.profileImageFileName)
            : undefined;
        return {
            breederId: summary.breederId,
            displayName: summary.displayName,
            profileImageUrl,
            locationText: summary.locationText,
            bpm: summary.bpm,
        };
    }
}
