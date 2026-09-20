import { BadRequestException, Injectable } from '@nestjs/common';

import type { BreederPetPostingProfileSnapshot } from '../../application/ports/breeder-pet-posting-profile.port';
import type {
    BreederPetPostingCreateCommand,
    BreederPetPostingCreatePersistData,
    BreederPetPostingGeneticTestRecordPersistData,
    BreederPetPostingParentSnapshotPersistData,
    BreederPetPostingUpdateCommand,
    BreederPetPostingUpdatePersistData,
    BreederPetPostingVaccinationRecordPersistData,
    PostingPetType,
} from '../../application/types/breeder-pet-posting-command.type';

/**
 * v2 분양글 작성/수정 — application command -> persistence data 매퍼.
 *
 * 날짜 문자열을 Date 로 변환하고, status 별로 records 또는 incompleteReason 만 보존한다.
 * petType 은 클라이언트 입력이 아니라 글쓴 브리더 계정에서 파생한다.
 *
 * 작성과 수정은 같은 변환 규칙(날짜 캐스팅, 사육 환경 정규화)을 공유하고,
 * "제공된 필드만 담는지" 여부만 다르다.
 */
@Injectable()
export class BreederPetPostingMapperService {
    toPersistData(
        breeder: BreederPetPostingProfileSnapshot,
        command: BreederPetPostingCreateCommand,
    ): BreederPetPostingCreatePersistData {
        return {
            breederId: breeder.breederId,
            name: command.name,
            breed: command.breed,
            gender: command.gender,
            birthDate: this.toDate(command.birthDate, '태어난 날짜'),
            price: command.price,
            description: command.description,
            photos: command.photos,
            representativePhotoIndex: command.representativePhotoIndex ?? 0,
            petType: this.requirePetType(breeder),
            status: 'available',
            isActive: true,

            vaccinationStatus: command.vaccinationStatus,
            vaccinationRecords:
                command.vaccinationStatus === 'completed'
                    ? this.toVaccinationRecords(command.vaccinationRecords ?? [])
                    : [],
            vaccinationIncompleteReason:
                command.vaccinationStatus === 'incomplete' ? command.vaccinationIncompleteReason?.trim() : undefined,

            geneticTestStatus: command.geneticTestStatus,
            geneticTestRecords:
                command.geneticTestStatus === 'completed'
                    ? this.toGeneticTestRecords(command.geneticTestRecords ?? [])
                    : [],
            geneticTestIncompleteReason:
                command.geneticTestStatus === 'incomplete' ? command.geneticTestIncompleteReason?.trim() : undefined,

            parentPetSnapshots: this.toParentSnapshots(command.parentPetSnapshots ?? []),
            breedingEnvironment: this.toBreedingEnvironment(command.breedingEnvironment),
        };
    }

    /**
     * 부분 수정 — 제공된(undefined 아닌) 필드만 담는다. 미제공 필드는 기존 DB 값이 유지된다.
     *
     * 건강 정보는 그룹 단위로 온다(validator 가 status 동반을 강제).
     * status 를 뒤집으면 반대편 값이 모순이 되므로 여기서 함께 정리한다 —
     * completed 면 미완료 사유를 제거(null)하고, incomplete 면 기록을 비운다.
     * 작성 시 mapper 가 status 에 맞지 않는 값을 애초에 저장하지 않는 것과 같은 규칙이다.
     */
    toUpdatePersistData(command: BreederPetPostingUpdateCommand): BreederPetPostingUpdatePersistData {
        const persist: BreederPetPostingUpdatePersistData = {};

        if (command.name !== undefined) persist.name = command.name;
        if (command.breed !== undefined) persist.breed = command.breed;
        if (command.gender !== undefined) persist.gender = command.gender;
        if (command.birthDate !== undefined) persist.birthDate = this.toDate(command.birthDate, '태어난 날짜');
        if (command.price !== undefined) persist.price = command.price;
        if (command.description !== undefined) persist.description = command.description;
        if (command.status !== undefined) persist.status = command.status;
        if (command.photos !== undefined) persist.photos = command.photos;
        if (command.representativePhotoIndex !== undefined) {
            persist.representativePhotoIndex = command.representativePhotoIndex;
        }

        if (command.vaccinationStatus !== undefined) {
            persist.vaccinationStatus = command.vaccinationStatus;
            if (command.vaccinationStatus === 'completed') {
                persist.vaccinationRecords = this.toVaccinationRecords(command.vaccinationRecords ?? []);
                persist.vaccinationIncompleteReason = null;
            } else {
                persist.vaccinationRecords = [];
                persist.vaccinationIncompleteReason = command.vaccinationIncompleteReason?.trim() ?? null;
            }
        }

        if (command.geneticTestStatus !== undefined) {
            persist.geneticTestStatus = command.geneticTestStatus;
            if (command.geneticTestStatus === 'completed') {
                persist.geneticTestRecords = this.toGeneticTestRecords(command.geneticTestRecords ?? []);
                persist.geneticTestIncompleteReason = null;
            } else {
                persist.geneticTestRecords = [];
                persist.geneticTestIncompleteReason = command.geneticTestIncompleteReason?.trim() ?? null;
            }
        }

        // 배열/객체는 전체 교체 — 빈 배열이면 부모 정보를 모두 지운다는 뜻이다
        if (command.parentPetSnapshots !== undefined) {
            persist.parentPetSnapshots = this.toParentSnapshots(command.parentPetSnapshots);
        }

        // 설명도 사진도 없는 객체가 오면 작성 때와 같이 "환경 없음"으로 정규화되고, 수정에서는 제거를 뜻한다
        if (command.breedingEnvironment !== undefined) {
            persist.breedingEnvironment = this.toBreedingEnvironment(command.breedingEnvironment) ?? null;
        }

        return persist;
    }

    /**
     * 탐색 페이지 축종 탭이 petType 으로 필터링하므로, 축종을 확정할 수 없는 분양글은 만들지 않는다.
     * breeders.petType 은 required 라 정상 계정이면 항상 채워져 있다.
     */
    private requirePetType(breeder: BreederPetPostingProfileSnapshot): PostingPetType {
        if (!breeder.petType) {
            throw new BadRequestException('브리더 계정의 축종 정보가 없어 분양글을 등록할 수 없습니다.');
        }
        return breeder.petType;
    }

    private toVaccinationRecords(
        records: BreederPetPostingCreateCommand['vaccinationRecords'] = [],
    ): BreederPetPostingVaccinationRecordPersistData[] {
        return records.map((record) => ({
            name: record.name,
            date: this.toDate(record.date, '접종일'),
            round: record.round,
        }));
    }

    private toGeneticTestRecords(
        records: BreederPetPostingCreateCommand['geneticTestRecords'] = [],
    ): BreederPetPostingGeneticTestRecordPersistData[] {
        return records.map((record) => ({
            date: this.toDate(record.date, '검사 검진일'),
            institution: record.institution,
            testName: record.testName,
            result: record.result,
        }));
    }

    private toParentSnapshots(
        snapshots: BreederPetPostingCreateCommand['parentPetSnapshots'] = [],
    ): BreederPetPostingParentSnapshotPersistData[] {
        return snapshots.map((snapshot) => ({
            relation: snapshot.relation,
            breed: snapshot.breed,
            name: snapshot.name,
            birthDate: snapshot.birthDate ? this.toDate(snapshot.birthDate, '부모 태어난 날짜') : undefined,
            photoFileName: snapshot.photoFileName,
        }));
    }

    private toBreedingEnvironment(
        environment: BreederPetPostingCreateCommand['breedingEnvironment'],
    ): BreederPetPostingCreatePersistData['breedingEnvironment'] {
        if (!environment) {
            return undefined;
        }
        const description = environment.description?.trim();
        // 배열이 우선, 없으면 레거시 단일 필드를 배열로 승격. 공백 제거 + 중복 제거 + 최대 5장.
        const rawNames =
            environment.photoFileNames && environment.photoFileNames.length > 0
                ? environment.photoFileNames
                : environment.photoFileName
                  ? [environment.photoFileName]
                  : [];
        const photoFileNames = [...new Set(rawNames.map((name) => name.trim()).filter(Boolean))].slice(0, 5);

        if (!description && photoFileNames.length === 0) {
            return undefined;
        }
        return {
            description: description || undefined,
            // photoFileName 은 하위 호환 소비자(기존 조회 응답)를 위해 첫 장을 함께 저장한다
            photoFileName: photoFileNames[0],
            photoFileNames: photoFileNames.length > 0 ? photoFileNames : undefined,
        };
    }

    private toDate(value: string, fieldLabel: string): Date {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldLabel} 형식이 올바르지 않습니다.`);
        }
        return date;
    }
}
