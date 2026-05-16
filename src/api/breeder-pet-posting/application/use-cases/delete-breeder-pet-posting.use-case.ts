import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import {
    BREEDER_PET_POSTING_WRITER_PORT,
    type BreederPetPostingWriterPort,
} from '../ports/breeder-pet-posting-writer.port';
import type { BreederPetPostingDeleteResult } from '../types/breeder-pet-posting-command.type';

/**
 * v2 분양글 soft delete use-case (브리더 본인 전용).
 *
 * - isActive=false 로 마킹. 다른 도메인이 참조하는 도큐먼트는 보존한다.
 * - 본인 글이 아니거나 이미 비활성/미존재면 BadRequestException ("해당 분양글을 찾을 수 없습니다.")
 * - 이미 비활성인 도큐먼트에 다시 호출하는 경우도 동일 — 미존재처럼 처리 (idempotent 아님)
 */
@Injectable()
export class DeleteBreederPetPostingUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_WRITER_PORT)
        private readonly writerPort: BreederPetPostingWriterPort,
    ) {}

    async execute(userId: string, petId: string): Promise<BreederPetPostingDeleteResult> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const { changed } = await this.writerPort.softDeleteByOwner(petId, breeder.breederId);
        if (!changed) {
            throw new BadRequestException('해당 분양글을 찾을 수 없습니다.');
        }

        return { petId, deleted: true };
    }
}
