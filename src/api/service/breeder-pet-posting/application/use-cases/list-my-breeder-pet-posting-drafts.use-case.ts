import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BreederPetPostingDraftCardMapperService } from '../../domain/services/breeder-pet-posting-draft-card-mapper.service';
import {
    BREEDER_PET_POSTING_ASSET_URL_PORT,
    type BreederPetPostingAssetUrlPort,
} from '../ports/breeder-pet-posting-asset-url.port';
import {
    BREEDER_PET_POSTING_DRAFT_PORT,
    type BreederPetPostingDraftPort,
} from '../ports/breeder-pet-posting-draft.port';
import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import type { BreederPetPostingDraftCardResult } from '../types/breeder-pet-posting-draft.type';

/**
 * v2 분양글 임시저장 — 내 임시저장 목록 (최신 저장순).
 * 브리더당 상한이 10개라 페이지네이션 없이 전체를 반환한다.
 */
@Injectable()
export class ListMyBreederPetPostingDraftsUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_DRAFT_PORT)
        private readonly draftPort: BreederPetPostingDraftPort,
        @Inject(BREEDER_PET_POSTING_ASSET_URL_PORT)
        private readonly assetUrlPort: BreederPetPostingAssetUrlPort,
        private readonly cardMapper: BreederPetPostingDraftCardMapperService,
    ) {}

    async execute(userId: string): Promise<BreederPetPostingDraftCardResult[]> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const drafts = await this.draftPort.listByOwner(breeder.breederId);
        return drafts.map((draft) => {
            const primaryFileName = this.cardMapper.resolvePrimaryPhotoFileName(draft);
            const primaryPhotoUrl = primaryFileName ? this.assetUrlPort.toSignedUrl(primaryFileName) : null;
            return this.cardMapper.toCard(draft, primaryPhotoUrl);
        });
    }
}
