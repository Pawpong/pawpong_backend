import { CommunitySharedModule } from './shared/community-shared.module';
import { CommunityPostsModule } from './posts/community-posts.module';
import { CommunityCommentsModule } from './comments/community-comments.module';
import { CommunityInteractionsModule } from './interactions/community-interactions.module';
import { CommunityAuthorSyncModule } from './author-sync/community-author-sync.module';
import { CommunityReportAdminModule } from '../../admin/community/community-report-admin.module';

// 커뮤니티 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 공유가 필요한 읽기 Port(게시글·작성자·팔로우·좋아요·저장)는 shared 가 소유한다.
export const COMMUNITY_MODULE_IMPORTS = [
    CommunitySharedModule,
    CommunityPostsModule,
    CommunityCommentsModule,
    CommunityInteractionsModule,
    CommunityAuthorSyncModule,
    CommunityReportAdminModule,
];
