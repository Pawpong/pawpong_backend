import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BreederPetPostingEditFormMapperService } from '../../domain/services/breeder-pet-posting-edit-form-mapper.service';
import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import {
    BREEDER_PET_POSTING_READER_PORT,
    type BreederPetPostingReaderPort,
} from '../ports/breeder-pet-posting-reader.port';
import type { BreederPetPostingEditDetailResult } from '../types/breeder-pet-posting-result.type';

/**
 * v2 분양글 수정 화면용 단건 조회 use-case (브리더 본인 전용).
 *
 * 공개 상세(GET /v2/adoption/:petId)는 표시용 DTO 라 사진 URL 만 내려주고 파일키가 없다.
 * 수정 화면은 PATCH 에 파일키를 되돌려 보내야 하므로, 임시저장 조회와 같은 계약으로
 * 파일키가 담긴 form + 미리보기 URL 을 함께 내려준다.
 *
 * 소유자 검증은 update/delete 와 동일하다 — 남의 글/비활성/미존재를 구분하지 않고
 * 400 ("해당 분양글을 찾을 수 없습니다.") 으로 통일해 다른 브리더 소유 정보를 누설하지 않는다.
 */
@Injectable()
export class GetBreederPetPostingForEditUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_READER_PORT)
        private readonly readerPort: BreederPetPostingReaderPort,
        private readonly editFormMapper: BreederPetPostingEditFormMapperService,
    ) {}

    async execute(userId: string, petId: string): Promise<BreederPetPostingEditDetailResult> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const snapshot = await this.readerPort.findEditSnapshotByOwner(petId, breeder.breederId);
        if (!snapshot) {
            throw new BadRequestException('해당 분양글을 찾을 수 없습니다.');
        }

        return this.editFormMapper.toEditDetail(snapshot);
    }
}
