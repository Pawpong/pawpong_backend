import { Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_ASSET_URL_PORT,
    type BreederPetPostingAssetUrlPort,
} from '../../application/ports/breeder-pet-posting-asset-url.port';
import type {
    BreederPetPostingEditBreedingEnvironment,
    BreederPetPostingEditSnapshot,
} from '../../application/ports/breeder-pet-posting-reader.port';
import type {
    BreederPetPostingEditDetailResult,
    BreederPetPostingEditFormResult,
    BreederPetPostingEditPhotoUrls,
} from '../../application/types/breeder-pet-posting-result.type';

/**
 * v2 분양글 수정 화면 매퍼 (도메인 계층).
 *
 * 임시저장 조회와 같은 계약을 발행된 분양글에도 적용한다 —
 * form 에는 저장된 파일키를 그대로 두고(그대로 PATCH 로 되돌려 보내야 한다),
 * 미리보기용 signed URL 은 같은 순서로 나란히 내려준다.
 *
 * 표시용 가공(가격 단위, relation 한글화, 날짜 포맷)은 하지 않는다 — 프론트 책임이다.
 * StorageService(infra) 대신 BreederPetPostingAssetUrlPort 추상화로 URL 을 받는다.
 */
@Injectable()
export class BreederPetPostingEditFormMapperService {
    constructor(
        @Inject(BREEDER_PET_POSTING_ASSET_URL_PORT)
        private readonly assetUrl: BreederPetPostingAssetUrlPort,
    ) {}

    toEditDetail(snapshot: BreederPetPostingEditSnapshot): BreederPetPostingEditDetailResult {
        const form = this.toForm(snapshot);
        return {
            petId: snapshot.petId,
            form,
            photoUrls: this.toPhotoUrls(form),
            status: snapshot.status,
            updatedAt: snapshot.updatedAt.toISOString(),
        };
    }

    private toForm(snapshot: BreederPetPostingEditSnapshot): BreederPetPostingEditFormResult {
        return {
            name: snapshot.name,
            breed: snapshot.breed,
            gender: snapshot.gender,
            birthDate: this.toDateString(snapshot.birthDate),
            price: snapshot.price,
            description: snapshot.description,
            photos: snapshot.photos,
            representativePhotoIndex: snapshot.representativePhotoIndex,
            petType: snapshot.petType,

            vaccinationStatus: snapshot.vaccinationStatus,
            vaccinationRecords: snapshot.vaccinationRecords.map((record) => ({
                name: record.name,
                date: this.toDateString(record.date),
                round: record.round,
            })),
            vaccinationIncompleteReason: snapshot.vaccinationIncompleteReason,

            geneticTestStatus: snapshot.geneticTestStatus,
            geneticTestRecords: snapshot.geneticTestRecords.map((record) => ({
                date: this.toDateString(record.date),
                institution: record.institution,
                testName: record.testName,
                result: record.result,
            })),
            geneticTestIncompleteReason: snapshot.geneticTestIncompleteReason,

            parentPetSnapshots: snapshot.parentPetSnapshots.map((parent) => ({
                relation: parent.relation,
                breed: parent.breed,
                name: parent.name,
                birthDate: parent.birthDate ? this.toDateString(parent.birthDate) : undefined,
                photoFileName: parent.photoFileName,
            })),

            breedingEnvironment: this.toFormBreedingEnvironment(snapshot.breedingEnvironment),
        };
    }

    private toFormBreedingEnvironment(
        environment: BreederPetPostingEditBreedingEnvironment | undefined,
    ): BreederPetPostingEditFormResult['breedingEnvironment'] {
        if (!environment) {
            return undefined;
        }
        return {
            description: environment.description,
            // 배열이 정식 필드다. 배열 도입 전 저장된 글은 단일 필드뿐이라 배열로 승격해 폼이 같은 모양을 받게 한다.
            photoFileNames: this.toEnvironmentFileNames(environment),
            photoFileName: environment.photoFileName,
        };
    }

    private toPhotoUrls(form: BreederPetPostingEditFormResult): BreederPetPostingEditPhotoUrls {
        const environmentPhotos = (form.breedingEnvironment?.photoFileNames ?? []).map((fileName) =>
            this.assetUrl.toSignedUrl(fileName),
        );
        return {
            pet: form.photos.map((fileName) => this.assetUrl.toSignedUrl(fileName)),
            parents: form.parentPetSnapshots.map((parent) =>
                parent.photoFileName ? this.assetUrl.toSignedUrl(parent.photoFileName) : null,
            ),
            breedingEnvironment: environmentPhotos[0] ?? null,
            breedingEnvironmentPhotos: environmentPhotos,
        };
    }

    /** photoFileNames 우선, 없으면 레거시 단일 필드를 배열로 승격 (작성 매퍼와 동일 규칙) */
    private toEnvironmentFileNames(environment: BreederPetPostingEditBreedingEnvironment): string[] | undefined {
        if (environment.photoFileNames && environment.photoFileNames.length > 0) {
            return environment.photoFileNames;
        }
        return environment.photoFileName ? [environment.photoFileName] : undefined;
    }

    /** 폼 date input 이 그대로 받는 YYYY-MM-DD. 저장은 UTC 자정이라 잘라내도 날짜가 밀리지 않는다. */
    private toDateString(date: Date): string {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().slice(0, 10);
    }
}
