import { BadRequestException, Injectable } from '@nestjs/common';

import type {
    BreederPetPostingCreateCommand,
    BreederPetPostingGeneticTestRecordCommand,
    BreederPetPostingParentSnapshotCommand,
    BreederPetPostingUpdateCommand,
    BreederPetPostingVaccinationRecordCommand,
    GeneticTestStatus,
    VaccinationStatus,
} from '../../application/types/breeder-pet-posting-command.type';

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 1;

/**
 * v2 분양글 입력 정합성 검증.
 *
 * class-validator 로 표현하기 어려운 cross-field 규칙을 도메인 레벨에서 강제한다.
 * - photos 1~10 장 + 대표 인덱스가 photos 범위 안
 * - vaccinationStatus 와 records / incompleteReason 의 상호 배타
 * - geneticTestStatus 와 records / incompleteReason 의 상호 배타
 *
 * 작성(validate)과 부분 수정(validateUpdate)은 규칙 자체를 공유하고 "무엇을 검사할지"만 다르다.
 * 작성은 전 필드가 있어야 하고, 수정은 온 필드만 본다.
 */
@Injectable()
export class BreederPetPostingValidatorService {
    validate(command: BreederPetPostingCreateCommand): void {
        this.assertPhotos(command.photos ?? [], command.representativePhotoIndex);
        this.assertVaccination(
            command.vaccinationStatus,
            command.vaccinationRecords,
            command.vaccinationIncompleteReason,
        );
        this.assertGeneticTest(
            command.geneticTestStatus,
            command.geneticTestRecords,
            command.geneticTestIncompleteReason,
        );
        this.assertParentSnapshots(command.parentPetSnapshots ?? []);
    }

    /**
     * 부분 수정 검증 — 온 필드만 본다. 미제공 필드는 기존 DB 값을 유지하므로 검사 대상이 아니다.
     *
     * 건강 정보는 status 없이 records/사유만 바꾸는 것을 막는다.
     * DB 를 읽지 않고는 "완료인데 기록 0건" 같은 모순을 판별할 수 없어서,
     * 그룹을 통째로 받아 그 안에서 정합성을 닫는다.
     */
    validateUpdate(command: BreederPetPostingUpdateCommand): void {
        this.assertUpdatePhotos(command);
        this.assertUpdateVaccination(command);
        this.assertUpdateGeneticTest(command);
        if (command.parentPetSnapshots !== undefined) {
            this.assertParentSnapshots(command.parentPetSnapshots);
        }
    }

    private assertUpdatePhotos(command: BreederPetPostingUpdateCommand): void {
        // photos 가 제공된 경우만 길이 + 대표 인덱스 검증.
        // 미제공이면 기존 photos 그대로 — DB 상태와 정합성은 그대로 유지된다.
        if (command.photos !== undefined) {
            this.assertPhotos(command.photos, command.representativePhotoIndex);
            return;
        }
        // photos 없이 대표 인덱스만 변경 — 클라이언트가 기존 photos 길이를 신뢰. 음수만 차단.
        if (command.representativePhotoIndex !== undefined && command.representativePhotoIndex < 0) {
            throw new BadRequestException('대표 사진 인덱스가 유효하지 않습니다.');
        }
    }

    private assertUpdateVaccination(command: BreederPetPostingUpdateCommand): void {
        const { vaccinationStatus, vaccinationRecords, vaccinationIncompleteReason } = command;
        const touched =
            vaccinationStatus !== undefined ||
            vaccinationRecords !== undefined ||
            vaccinationIncompleteReason !== undefined;
        if (!touched) {
            return;
        }
        if (vaccinationStatus === undefined) {
            throw new BadRequestException('접종 정보를 수정하려면 접종 상태를 함께 보내주세요.');
        }
        this.assertVaccination(vaccinationStatus, vaccinationRecords, vaccinationIncompleteReason);
    }

    private assertUpdateGeneticTest(command: BreederPetPostingUpdateCommand): void {
        const { geneticTestStatus, geneticTestRecords, geneticTestIncompleteReason } = command;
        const touched =
            geneticTestStatus !== undefined ||
            geneticTestRecords !== undefined ||
            geneticTestIncompleteReason !== undefined;
        if (!touched) {
            return;
        }
        if (geneticTestStatus === undefined) {
            throw new BadRequestException('유전병 검사 정보를 수정하려면 검사 상태를 함께 보내주세요.');
        }
        this.assertGeneticTest(geneticTestStatus, geneticTestRecords, geneticTestIncompleteReason);
    }

    private assertPhotos(photos: string[], representativePhotoIndex?: number): void {
        if (photos.length < MIN_PHOTOS) {
            throw new BadRequestException('이미지를 최소 1장 이상 업로드해주세요.');
        }
        if (photos.length > MAX_PHOTOS) {
            throw new BadRequestException(`이미지는 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
        }

        const index = representativePhotoIndex ?? 0;
        if (index < 0 || index >= photos.length) {
            throw new BadRequestException('대표 사진 인덱스가 업로드된 이미지 범위를 벗어났습니다.');
        }
    }

    private assertVaccination(
        status: VaccinationStatus,
        records: BreederPetPostingVaccinationRecordCommand[] | undefined,
        incompleteReason: string | undefined,
    ): void {
        if (status === 'completed') {
            if (!records || records.length === 0) {
                throw new BadRequestException('접종 완료 시 접종 기록을 1개 이상 입력해주세요.');
            }
            if (incompleteReason && incompleteReason.trim().length > 0) {
                throw new BadRequestException('접종 완료 상태에서는 미완료 사유를 입력할 수 없습니다.');
            }
            return;
        }

        // incomplete
        if (!incompleteReason || incompleteReason.trim().length === 0) {
            throw new BadRequestException('접종 미완료 사유를 입력해주세요.');
        }
        if (records && records.length > 0) {
            throw new BadRequestException('접종 미완료 상태에서는 접종 기록을 입력할 수 없습니다.');
        }
    }

    private assertGeneticTest(
        status: GeneticTestStatus,
        records: BreederPetPostingGeneticTestRecordCommand[] | undefined,
        incompleteReason: string | undefined,
    ): void {
        if (status === 'completed') {
            if (!records || records.length === 0) {
                throw new BadRequestException('유전병 검사 완료 시 검사 기록을 1개 이상 입력해주세요.');
            }
            if (incompleteReason && incompleteReason.trim().length > 0) {
                throw new BadRequestException('검사 완료 상태에서는 미완료 사유를 입력할 수 없습니다.');
            }
            return;
        }

        // incomplete
        if (!incompleteReason || incompleteReason.trim().length === 0) {
            throw new BadRequestException('유전병 검사 미완료 사유를 입력해주세요.');
        }
        if (records && records.length > 0) {
            throw new BadRequestException('검사 미완료 상태에서는 검사 기록을 입력할 수 없습니다.');
        }
    }

    private assertParentSnapshots(snapshots: BreederPetPostingParentSnapshotCommand[]): void {
        const fathers = snapshots.filter((s) => s.relation === 'father').length;
        const mothers = snapshots.filter((s) => s.relation === 'mother').length;
        if (fathers > 1) {
            throw new BadRequestException('아빠 정보는 1개까지만 등록할 수 있습니다.');
        }
        if (mothers > 1) {
            throw new BadRequestException('엄마 정보는 1개까지만 등록할 수 있습니다.');
        }
    }
}
