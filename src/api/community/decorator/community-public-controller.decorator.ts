import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { ApiCommunityPublicController } from '../swagger';

/**
 * v2 커뮤니티 공개 라우트 — 비로그인 접근 가능.
 * 로그인 사용자라면 추후 isLiked/isSaved 같은 응답을 채울 수 있도록 OptionalJwtAuthGuard 사용.
 */
export function CommunityPublicController() {
    return applyDecorators(ApiCommunityPublicController(), Controller('v2/community'), UseGuards(OptionalJwtAuthGuard));
}
