import { NotificationModule } from '../../notification/notification.module';
import { CommunitySharedModule } from '../shared/community-shared.module';
import { CommunityPostLikeController } from '../controller/community-post-like.controller';
import { CommunityPostBookmarkController } from '../controller/community-post-bookmark.controller';
import { CommunityPostReportController } from '../controller/community-post-report.controller';
import { LikeCommunityPostUseCase } from '../application/use-cases/like-community-post.use-case';
import { UnlikeCommunityPostUseCase } from '../application/use-cases/unlike-community-post.use-case';
import { SaveCommunityPostUseCase } from '../application/use-cases/save-community-post.use-case';
import { UnsaveCommunityPostUseCase } from '../application/use-cases/unsave-community-post.use-case';
import { GetMySavedCommunityPostsUseCase } from '../application/use-cases/get-my-saved-community-posts.use-case';
import { ReportCommunityPostUseCase } from '../application/use-cases/report-community-post.use-case';
import { CommunityReportRepository } from '../repository/community-report.repository';
import { CommunityReportMongooseAdapter } from '../infrastructure/community-report-mongoose.adapter';
import { COMMUNITY_REPORT_PORT } from '../application/ports/community-report.port';

// 커뮤니티 > 상호작용 슬라이스 (좋아요·저장·신고)
// 좋아요/저장 Port 는 상세·목록에서도 쓰이므로 shared 소유이고, 여기서는 신고만 직접 소유한다.
// 좋아요 시 글쓴이에게 알림을 보내므로 NotificationModule(DISPATCH Port)이 필요하다.
export const COMMUNITY_INTERACTIONS_MODULE_IMPORTS = [CommunitySharedModule, NotificationModule];

export const COMMUNITY_INTERACTIONS_MODULE_CONTROLLERS = [
    CommunityPostLikeController,
    CommunityPostBookmarkController,
    CommunityPostReportController,
];

export const COMMUNITY_INTERACTIONS_MODULE_PROVIDERS = [
    LikeCommunityPostUseCase,
    UnlikeCommunityPostUseCase,
    SaveCommunityPostUseCase,
    UnsaveCommunityPostUseCase,
    GetMySavedCommunityPostsUseCase,
    ReportCommunityPostUseCase,
    CommunityReportRepository,
    CommunityReportMongooseAdapter,
    { provide: COMMUNITY_REPORT_PORT, useExisting: CommunityReportMongooseAdapter },
];

// 관리자 신고 처리 슬라이스가 동일 어댑터를 재사용
export const COMMUNITY_INTERACTIONS_MODULE_EXPORTS = [CommunityReportRepository, CommunityReportMongooseAdapter];
