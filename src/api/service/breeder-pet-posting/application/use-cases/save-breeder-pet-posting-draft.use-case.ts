import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_DRAFT_PORT,
    type BreederPetPostingDraftPort,
} from '../ports/breeder-pet-posting-draft.port';
import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import type {
    BreederPetPostingDraftForm,
    BreederPetPostingDraftSaveResult,
} from '../types/breeder-pet-posting-draft.type';

/** 브리더당 임시저장 상한 — 무제한 축적을 막는다 */
const MAX_DRAFTS_PER_BREEDER = 10;

/**
 * v2 분양글 임시저장 — 저장(신규)과 덮어쓰기(기존 draftId)를 한 use-case 로 처리한다.
 * draft 는 미완성 폼 상태라 cross-field 검증 없이 payload 를 그대로 보관한다.
 */
@Injectable()
export class SaveBreederPetPostingDraftUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_DRAFT_PORT)
        private readonly draftPort: BreederPetPostingDraftPort,
    ) {}

    async execute(
        userId: string,
        draftId: string | null,
        form: BreederPetPostingDraftForm,
    ): Promise<BreederPetPostingDraftSaveResult> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        if (draftId) {
            const { updated } = await this.draftPort.updateByOwner(draftId, breeder.breederId, form);
            if (!updated) {
                throw new BadRequestException('해당 임시저장 글을 찾을 수 없습니다.');
            }
            return { draftId };
        }

        const count = await this.draftPort.countByOwner(breeder.breederId);
        if (count >= MAX_DRAFTS_PER_BREEDER) {
            throw new BadRequestException(`임시저장은 최대 ${MAX_DRAFTS_PER_BREEDER}개까지 보관할 수 있습니다.`);
        }

        return this.draftPort.create(breeder.breederId, form);
    }
}
