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
        if (body.length === 0) {
            throw new BadRequestException('본문을 작성해 주세요.');
        }
        if (body.length > MAX_BODY) {
            throw new BadRequestException(`본문은 ${MAX_BODY}자 이내여야 합니다.`);
        }
        this.validateOptionalLimits(command);
    }

    validateUpdate(patch: CommunityPostUpdateCommand): void {
        if (Object.keys(patch).length === 0) {
            throw new BadRequestException('수정할 내용이 없습니다.');
        }
        if (patch.body !== undefined) {
            const trimmed = patch.body.trim();
            if (trimmed.length === 0) {
                throw new BadRequestException('본문을 비울 수 없습니다.');
            }
            if (trimmed.length > MAX_BODY) {
                throw new BadRequestException(`본문은 ${MAX_BODY}자 이내여야 합니다.`);
            }
        }
        this.validateOptionalLimits(patch);
    }

    private validateOptionalLimits(input: {
        title?: string;
        photos?: string[];
        category?: string;
    }): void {
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
