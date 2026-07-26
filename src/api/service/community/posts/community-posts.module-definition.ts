import { RedisModule } from '../../../../common/redis/redis.module';

import { CommunitySharedModule } from '../shared/community-shared.module';
import { CommunityPostListController } from '../controller/community-post-list.controller';
import { CommunityPostDetailController } from '../controller/community-post-detail.controller';
import { CommunityPostDraftController } from '../controller/community-post-draft.controller';
import { CommunityPostWriteController } from '../controller/community-post-write.controller';
import { CommunityPostViewCountController } from '../controller/community-post-view-count.controller';
import { GetCommunityPostListUseCase } from '../application/use-cases/get-community-post-list.use-case';
import { GetCommunityPostDetailUseCase } from '../application/use-cases/get-community-post-detail.use-case';
import { CreateCommunityPostUseCase } from '../application/use-cases/create-community-post.use-case';
import { UpdateCommunityPostUseCase } from '../application/use-cases/update-community-post.use-case';
import { DeleteCommunityPostUseCase } from '../application/use-cases/delete-community-post.use-case';
import { IncrementViewCountUseCase } from '../application/use-cases/increment-view-count.use-case';
import { CommunityPostWriteValidatorService } from '../domain/services/community-post-write-validator.service';
import { CommunityPostWriterMongooseAdapter } from '../infrastructure/community-post-writer-mongoose.adapter';
import { COMMUNITY_POST_WRITER_PORT } from '../application/ports/community-post-writer.port';

// 커뮤니티 > 게시글 슬라이스 (목록·상세·작성/수정/삭제·임시저장·조회수)
// 조회수 중복 방지에 Redis 를 사용한다.
export const COMMUNITY_POSTS_MODULE_IMPORTS = [CommunitySharedModule, RedisModule];

export const COMMUNITY_POSTS_MODULE_CONTROLLERS = [
    CommunityPostListController,
    CommunityPostDetailController,
    CommunityPostDraftController,
    CommunityPostWriteController,
    CommunityPostViewCountController,
];

export const COMMUNITY_POSTS_MODULE_PROVIDERS = [
    GetCommunityPostListUseCase,
    GetCommunityPostDetailUseCase,
    CreateCommunityPostUseCase,
    UpdateCommunityPostUseCase,
    DeleteCommunityPostUseCase,
    IncrementViewCountUseCase,
    CommunityPostWriteValidatorService,
    CommunityPostWriterMongooseAdapter,
    { provide: COMMUNITY_POST_WRITER_PORT, useExisting: CommunityPostWriterMongooseAdapter },
];

export const COMMUNITY_POSTS_MODULE_EXPORTS = [COMMUNITY_POST_WRITER_PORT];
