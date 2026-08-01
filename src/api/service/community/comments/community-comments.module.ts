import { Module } from '@nestjs/common';

import {
    COMMUNITY_COMMENTS_MODULE_CONTROLLERS,
    COMMUNITY_COMMENTS_MODULE_IMPORTS,
    COMMUNITY_COMMENTS_MODULE_PROVIDERS,
} from './community-comments.module-definition';

/**
 * 커뮤니티 > 댓글 슬라이스
 * - 댓글·답글 작성/수정/삭제, 목록 조회
 */
@Module({
    imports: COMMUNITY_COMMENTS_MODULE_IMPORTS,
    controllers: COMMUNITY_COMMENTS_MODULE_CONTROLLERS,
    providers: COMMUNITY_COMMENTS_MODULE_PROVIDERS,
})
export class CommunityCommentsModule {}
