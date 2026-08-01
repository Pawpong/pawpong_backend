import { BadRequestException, Injectable } from '@nestjs/common';

import type { BreederPetPostingCreateCommand } from '../../application/types/breeder-pet-posting-command.type';

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 1;

/**
 * v2 분양글 작성 입력 정합성 검증.
 *
 * class-validator 로 표현하기 어려운 cross-field 규칙을 도메인 레벨에서 강제한다.
 * - photos 1~10 장 + 대표 인덱스가 photos 범위 안
 * - vaccinationStatus 와 records / incompleteReason 의 상호 배타
 * - geneticTestStatus 와 records / incompleteReason 의 상호 배타
 */
@Injectable()
export class BreederPetPostingValidatorService {
    validate(command: BreederPetPostingCreateCommand): void {
        this.validatePhotos(command);
        this.validateVaccination(command);
        this.validateGeneticTest(command);
        this.validateParentSnapshots(command);
    }

    private validatePhotos(command: BreederPetPostingCreateCommand): void {
        const photos = command.photos ?? [];
        if (photos.length < MIN_PHOTOS) {
            throw new BadRequestException('이미지를 최소 1장 이상 업로드해주세요.');
        }
        if (photos.length > MAX_PHOTOS) {
            throw new BadRequestException(`이미지는 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
        }

        const index = command.representativePhotoIndex ?? 0;
        if (index < 0 || index >= photos.length) {
            throw new BadRequestException('대표 사진 인덱스가 업로드된 이미지 범위를 벗어났습니다.');
        }
    }

    private validateVaccination(command: BreederPetPostingCreateCommand): void {
        const { vaccinationStatus, vaccinationRecords, vaccinationIncompleteReason } = command;

        if (vaccinationStatus === 'completed') {
            if (!vaccinationRecords || vaccinationRecords.length === 0) {
                throw new BadRequestException('접종 완료 시 접종 기록을 1개 이상 입력해주세요.');
            }
            if (vaccinationIncompleteReason && vaccinationIncompleteReason.trim().length > 0) {
                throw new BadRequestException('접종 완료 상태에서는 미완료 사유를 입력할 수 없습니다.');
            }
            return;
        }

        // incomplete
        if (!vaccinationIncompleteReason || vaccinationIncompleteReason.trim().length === 0) {
            throw new BadRequestException('접종 미완료 사유를 입력해주세요.');
        }
        if (vaccinationRecords && vaccinationRecords.length > 0) {
            throw new BadRequestException('접종 미완료 상태에서는 접종 기록을 입력할 수 없습니다.');
        }
    }

    private validateGeneticTest(command: BreederPetPostingCreateCommand): void {
        const { geneticTestStatus, geneticTestRecords, geneticTestIncompleteReason } = command;

        if (geneticTestStatus === 'completed') {
            if (!geneticTestRecords || geneticTestRecords.length === 0) {
                throw new BadRequestException('유전병 검사 완료 시 검사 기록을 1개 이상 입력해주세요.');
            }
            if (geneticTestIncompleteReason && geneticTestIncompleteReason.trim().length > 0) {
                throw new BadRequestException('검사 완료 상태에서는 미완료 사유를 입력할 수 없습니다.');
            }
            return;
        }

        // incomplete
        if (!geneticTestIncompleteReason || geneticTestIncompleteReason.trim().length === 0) {
            throw new BadRequestException('유전병 검사 미완료 사유를 입력해주세요.');
        }
        if (geneticTestRecords && geneticTestRecords.length > 0) {
            throw new BadRequestException('검사 미완료 상태에서는 검사 기록을 입력할 수 없습니다.');
        }
    }

    private validateParentSnapshots(command: BreederPetPostingCreateCommand): void {
        const snapshots = command.parentPetSnapshots ?? [];
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
