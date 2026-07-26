import { Module } from '@nestjs/common';

import {
    COMMUNITY_SHARED_MODULE_EXPORTS,
    COMMUNITY_SHARED_MODULE_IMPORTS,
    COMMUNITY_SHARED_MODULE_PROVIDERS,
} from './community-shared.module-definition';

/**
 * 커뮤니티 공통 슬라이스
 * - 게시글 읽기·작성자 조회·팔로우 관계·이미지 URL·좋아요/저장 상태 Port
 */
@Module({
    imports: COMMUNITY_SHARED_MODULE_IMPORTS,
    providers: COMMUNITY_SHARED_MODULE_PROVIDERS,
    exports: COMMUNITY_SHARED_MODULE_EXPORTS,
})
export class CommunitySharedModule {}
