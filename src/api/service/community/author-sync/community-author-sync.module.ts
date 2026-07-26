import { Module } from '@nestjs/common';

import {
    COMMUNITY_AUTHOR_SYNC_MODULE_IMPORTS,
    COMMUNITY_AUTHOR_SYNC_MODULE_PROVIDERS,
} from './community-author-sync.module-definition';

/**
 * 커뮤니티 > 작성자 스냅샷 동기화 슬라이스
 * - 프로필 변경 이벤트 → 게시글·댓글의 작성자 정보 갱신
 */
@Module({
    imports: COMMUNITY_AUTHOR_SYNC_MODULE_IMPORTS,
    providers: COMMUNITY_AUTHOR_SYNC_MODULE_PROVIDERS,
})
export class CommunityAuthorSyncModule {}
