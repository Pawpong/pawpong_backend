import { Module } from '@nestjs/common';

import {
    COMMUNITY_POSTS_MODULE_CONTROLLERS,
    COMMUNITY_POSTS_MODULE_EXPORTS,
    COMMUNITY_POSTS_MODULE_IMPORTS,
    COMMUNITY_POSTS_MODULE_PROVIDERS,
} from './community-posts.module-definition';

/**
 * 커뮤니티 > 게시글 슬라이스
 * - 목록·상세·임시저장 조회
 * - 작성/수정/삭제, 조회수 증가
 */
@Module({
    imports: COMMUNITY_POSTS_MODULE_IMPORTS,
    controllers: COMMUNITY_POSTS_MODULE_CONTROLLERS,
    providers: COMMUNITY_POSTS_MODULE_PROVIDERS,
    exports: COMMUNITY_POSTS_MODULE_EXPORTS,
})
export class CommunityPostsModule {}
