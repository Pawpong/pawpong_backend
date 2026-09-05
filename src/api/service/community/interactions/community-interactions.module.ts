import { Module } from '@nestjs/common';

import {
    COMMUNITY_INTERACTIONS_MODULE_CONTROLLERS,
    COMMUNITY_INTERACTIONS_MODULE_EXPORTS,
    COMMUNITY_INTERACTIONS_MODULE_IMPORTS,
    COMMUNITY_INTERACTIONS_MODULE_PROVIDERS,
} from './community-interactions.module-definition';

/**
 * 커뮤니티 > 상호작용 슬라이스
 * - 게시글 좋아요/좋아요 취소
 * - 저장(북마크)/저장 취소, 내가 저장한 글 목록
 * - 게시글 신고
 */
@Module({
    imports: COMMUNITY_INTERACTIONS_MODULE_IMPORTS,
    controllers: COMMUNITY_INTERACTIONS_MODULE_CONTROLLERS,
    providers: COMMUNITY_INTERACTIONS_MODULE_PROVIDERS,
    exports: COMMUNITY_INTERACTIONS_MODULE_EXPORTS,
})
export class CommunityInteractionsModule {}
