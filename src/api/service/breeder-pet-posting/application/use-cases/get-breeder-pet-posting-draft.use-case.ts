import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_DRAFT_PORT,
    type BreederPetPostingDraftPort,
} from '../ports/breeder-pet-posting-draft.port';
import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import {
    BREEDER_PET_POSTING_ASSET_URL_PORT,
    type BreederPetPostingAssetUrlPort,
} from '../ports/breeder-pet-posting-asset-url.port';
import { BreederPetPostingDraftPhotoUrlService } from '../../domain/services/breeder-pet-posting-draft-photo-url.service';
import type { BreederPetPostingDraftDetailResult } from '../types/breeder-pet-posting-draft.type';

/**
 * v2 분양글 임시저장 — 단건 조회 (작성 화면 복원용, 저장했던 payload 그대로 반환).
 */
@Injectable()
export class GetBreederPetPostingDraftUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_DRAFT_PORT)
        private readonly draftPort: BreederPetPostingDraftPort,
        @Inject(BREEDER_PET_POSTING_ASSET_URL_PORT)
        private readonly assetUrlPort: BreederPetPostingAssetUrlPort,
        private readonly draftPhotoUrlService: BreederPetPostingDraftPhotoUrlService,
    ) {}

    async execute(userId: string, draftId: string): Promise<BreederPetPostingDraftDetailResult> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const draft = await this.draftPort.findByOwner(draftId, breeder.breederId);
        if (!draft) {
            throw new BadRequestException('해당 임시저장 글을 찾을 수 없습니다.');
        }

        return {
            draftId: draft.draftId,
            // form 은 파일키 그대로 — 재저장·발행 시 그 키를 다시 보내야 한다
            form: draft.form,
            // 미리보기용 URL 은 같은 순서로 따로 내려준다 (클라이언트는 키를 URL 로 바꿀 수 없다)
            photoUrls: this.draftPhotoUrlService.toPhotoUrls(draft.form, (fileName) =>
                this.assetUrlPort.toSignedUrl(fileName),
            ),
            updatedAt: draft.updatedAt.toISOString(),
        };
    }
}
