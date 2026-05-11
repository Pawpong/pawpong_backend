import { Module } from '@nestjs/common';

import {
    COMMUNITY_MODULE_CONTROLLERS,
    COMMUNITY_MODULE_IMPORTS,
    COMMUNITY_MODULE_PROVIDERS,
} from './community.module-definition';

/**
 * v2 커뮤니티 모듈 (read-only slice).
 * /api/v2/community/* — 게시글 목록 / 상세 / 댓글 페이지네이션.
 *
 * 작성/수정/삭제 + 좋아요/저장 토글 + 저자별 목록은 후속 slice 에서 추가한다.
 */
@Module({
    imports: COMMUNITY_MODULE_IMPORTS,
    controllers: COMMUNITY_MODULE_CONTROLLERS,
    providers: COMMUNITY_MODULE_PROVIDERS,
})
export class CommunityModule {}
