import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_DRAFT_PORT,
    type BreederPetPostingDraftPort,
} from '../ports/breeder-pet-posting-draft.port';
import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import type { BreederPetPostingDraftDeleteResult } from '../types/breeder-pet-posting-draft.type';

/**
 * v2 분양글 임시저장 — 삭제.
 * draft 는 다른 도메인이 참조하지 않으므로 hard delete 한다.
 */
@Injectable()
export class DeleteBreederPetPostingDraftUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_DRAFT_PORT)
        private readonly draftPort: BreederPetPostingDraftPort,
    ) {}

    async execute(userId: string, draftId: string): Promise<BreederPetPostingDraftDeleteResult> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const { deleted } = await this.draftPort.deleteByOwner(draftId, breeder.breederId);
        if (!deleted) {
            throw new BadRequestException('해당 임시저장 글을 찾을 수 없습니다.');
        }

        return { draftId, deleted: true };
    }
}
