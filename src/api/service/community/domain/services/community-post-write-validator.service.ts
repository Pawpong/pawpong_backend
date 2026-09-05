import { BadRequestException, Injectable } from '@nestjs/common';

import type {
    CommunityPostCreateCommand,
    CommunityPostUpdateCommand,
} from '../../application/types/community-post-write.type';

const MAX_PHOTOS = 10;
const MAX_BODY = 2000;
const MAX_TITLE = 100;
const MAX_CATEGORY = 50;

/**
 * v2 커뮤니티 게시글 작성/수정 입력 정합성 검증.
 * class-validator 로 표현하기 어려운 cross-field/trim 규칙을 도메인 레벨에서 강제한다.
 */
@Injectable()
export class CommunityPostWriteValidatorService {
    validateCreate(command: CommunityPostCreateCommand): void {
        const body = command.body?.trim() ?? '';
        // 발행 글은 본문 필수, 임시저장(draft) 은 미완성 저장을 허용해 빈 본문도 통과시킨다.
        if (command.status !== 'draft' && body.length === 0) {
            throw new BadRequestException('본문을 작성해 주세요.');
        }
        if (body.length > MAX_BODY) {
            throw new BadRequestException(`본문은 ${MAX_BODY}자 이내여야 합니다.`);
        }
        this.validateOptionalLimits(command);
    }

    /**
     * 수정 패치 정합성 검증.
     *
     * "본문을 비울 수 없음" 같은 발행 전제 규칙은 최종 status 를 아는 use-case 에서 강제한다.
     * (draft 는 빈 본문 저장이 정상이므로 validator 는 길이/형식만 본다.)
     */
    validateUpdate(patch: CommunityPostUpdateCommand): void {
        if (Object.keys(patch).length === 0) {
            throw new BadRequestException('수정할 내용이 없습니다.');
        }
        if (patch.body !== undefined && patch.body.trim().length > MAX_BODY) {
            throw new BadRequestException(`본문은 ${MAX_BODY}자 이내여야 합니다.`);
        }
        this.validateOptionalLimits(patch);
    }

    private validateOptionalLimits(input: { title?: string; photos?: string[]; category?: string }): void {
        if (input.title !== undefined && input.title.length > MAX_TITLE) {
            throw new BadRequestException(`제목은 ${MAX_TITLE}자 이내여야 합니다.`);
        }
        if (input.photos !== undefined && input.photos.length > MAX_PHOTOS) {
            throw new BadRequestException(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있습니다.`);
        }
        if (input.category !== undefined && input.category.length > MAX_CATEGORY) {
            throw new BadRequestException(`카테고리는 ${MAX_CATEGORY}자 이내여야 합니다.`);
        }
    }
}
