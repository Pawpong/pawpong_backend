import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import {
    BREEDER_PET_POSTING_WRITER_PORT,
    type BreederPetPostingWriterPort,
} from '../ports/breeder-pet-posting-writer.port';
import type {
    BreederPetPostingUpdateCommand,
    BreederPetPostingUpdatePersistData,
} from '../types/breeder-pet-posting-command.type';

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 1;

/**
 * v2 분양글 부분 수정 use-case (브리더 본인 전용).
 *
 * - StrictRolesGuard('breeder') 가 컨트롤러 단에서 role 강제
 * - 본인 글 아니거나 비활성/미존재면 BadRequestException ("해당 분양글을 찾을 수 없습니다.")
 *   → 다른 브리더 소유 정보 누설 방지를 위해 403 대신 400 으로 통일
 *
 * 입력 필드 화이트리스트는 BreederPetPostingUpdateCommand 가 정의한다.
 */
@Injectable()
export class UpdateBreederPetPostingUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_WRITER_PORT)
        private readonly writerPort: BreederPetPostingWriterPort,
    ) {}

    async execute(userId: string, petId: string, command: BreederPetPostingUpdateCommand): Promise<{ petId: string }> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const persistData = this.toPersistData(command);

        const { changed } = await this.writerPort.updateByOwner(petId, breeder.breederId, persistData);
        if (!changed) {
            throw new BadRequestException('해당 분양글을 찾을 수 없습니다.');
        }

        return { petId };
    }

    private toPersistData(command: BreederPetPostingUpdateCommand): BreederPetPostingUpdatePersistData {
        // photos 가 제공된 경우만 길이 + 대표 인덱스 검증 (cross-field).
        // 미제공이면 기존 photos 그대로 — DB 상태와 정합성은 그대로 유지된다.
        if (command.photos !== undefined) {
            if (command.photos.length < MIN_PHOTOS) {
                throw new BadRequestException('이미지를 최소 1장 이상 업로드해주세요.');
            }
            if (command.photos.length > MAX_PHOTOS) {
                throw new BadRequestException(`이미지는 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
            }
            const index = command.representativePhotoIndex ?? 0;
            if (index < 0 || index >= command.photos.length) {
                throw new BadRequestException('대표 사진 인덱스가 업로드된 이미지 범위를 벗어났습니다.');
            }
        } else if (command.representativePhotoIndex !== undefined) {
            // photos 없이 대표 인덱스만 변경 — 클라이언트가 기존 photos 길이를 신뢰. 음수만 차단.
            if (command.representativePhotoIndex < 0) {
                throw new BadRequestException('대표 사진 인덱스가 유효하지 않습니다.');
            }
        }

        const persist: BreederPetPostingUpdatePersistData = {};
        if (command.name !== undefined) persist.name = command.name;
        if (command.breed !== undefined) persist.breed = command.breed;
        if (command.gender !== undefined) persist.gender = command.gender;
        if (command.birthDate !== undefined) persist.birthDate = new Date(command.birthDate);
        if (command.price !== undefined) persist.price = command.price;
        if (command.description !== undefined) persist.description = command.description;
        if (command.petType !== undefined) persist.petType = command.petType;
        if (command.status !== undefined) persist.status = command.status;
        if (command.photos !== undefined) persist.photos = command.photos;
        if (command.representativePhotoIndex !== undefined) {
            persist.representativePhotoIndex = command.representativePhotoIndex;
        }
        return persist;
    }
}
