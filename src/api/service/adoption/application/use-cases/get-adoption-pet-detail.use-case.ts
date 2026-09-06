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
import { ADOPTION_RECORD_READER_PORT, type AdoptionRecordReaderPort } from '../ports/adoption-record-reader.port';
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
        @Inject(ADOPTION_RECORD_READER_PORT)
        private readonly recordReader: AdoptionRecordReaderPort,
        private readonly mapper: AdoptionPetMapperService,
    ) {}

    async execute(input: {
        petId: string;
        /**
         * 로그인 사용자 id. 입양자·브리더 모두 올 수 있다 — 브리더도 다른 브리더의 펫에 입양 신청을 한다.
         * (즐겨찾기·내 신청 상태 모두 역할과 무관하게 이 id 로 조회한다)
         */
        viewerUserId?: string;
    }): Promise<AdoptionPetDetailResult> {
        const detail = await this.petReader.readByIdDetailed(input.petId);
        if (!detail) {
            throw new BadRequestException('해당 동물을 찾을 수 없습니다.');
        }

        // 상세 진입 시 viewCount 원자 증가 (incrementViewCount 가 새 값 반환)
        const newViewCount = await this.petWriter.incrementViewCount(input.petId);
        const effectiveViewCount = newViewCount ?? detail.viewCount;

        // 배열(photoFileNames) 우선, 배열 도입 전 데이터는 단일(photoFileName)을 배열로 승격
        const environmentFileNames =
            detail.breedingEnvironment?.photoFileNames && detail.breedingEnvironment.photoFileNames.length > 0
                ? detail.breedingEnvironment.photoFileNames
                : detail.breedingEnvironment?.photoFileName
                  ? [detail.breedingEnvironment.photoFileName]
                  : [];

        // 이미 신청한 펫이면 프론트가 '입양 신청하기' 대신 '내 신청서 보기'를 보여줘야 한다.
        // 역할로 막지 않는다 — 브리더도 다른 브리더의 펫에 입양 신청을 하므로 같은 재신청 차단에 걸린다.
        // 자기 분양글을 보는 브리더는 애초에 자기 펫에 낸 신청이 없어 자연히 null 이 된다.
        const viewerUserId = input.viewerUserId;

        const [photoUrls, parents, environmentPhotoUrls, breederSummary, favoritedSet, myApplication] =
            await Promise.all([
                Promise.all(detail.photos.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName))),
                this.resolveParentPhotos(detail.parentPetSnapshots),
                Promise.all(environmentFileNames.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName))),
                this.breederSummaryPort.readSummary(detail.breederId),
                viewerUserId
                    ? this.favoriteReader.findFavoritedPetIds(viewerUserId, [detail.id])
                    : Promise.resolve(new Set<string>()),
                viewerUserId
                    ? this.recordReader.findMyBlockingApplicationForPet(viewerUserId, detail.id)
                    : Promise.resolve(null),
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
                      photoUrl: environmentPhotoUrls[0],
                      photoUrls: environmentPhotoUrls,
                  }
                : undefined,
            breeder: breederBlock,
            myApplicationId: myApplication?.applicationId,
            myApplicationStatus: myApplication?.status,
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
