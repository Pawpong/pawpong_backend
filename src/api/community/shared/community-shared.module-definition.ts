import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { UserFollow, UserFollowSchema } from '../../../schema/user-follow.schema';
import { CommunityPost, CommunityPostSchema } from '../../../schema/community-post.schema';
import { CommunityPostComment, CommunityPostCommentSchema } from '../../../schema/community-post-comment.schema';
import { CommunityPostLike, CommunityPostLikeSchema } from '../../../schema/community-post-like.schema';
import { CommunityPostReport, CommunityPostReportSchema } from '../../../schema/community-post-report.schema';
import { CommunityBookmark, CommunityBookmarkSchema } from '../../../schema/community-bookmark.schema';

import { CommunityRepository } from '../repository/community.repository';
import { CommunityLikeRepository } from '../repository/community-like.repository';
import { CommunityBookmarkRepository } from '../repository/community-bookmark.repository';
import { CommunityPostReaderMongooseAdapter } from '../infrastructure/community-post-reader-mongoose.adapter';
import { CommunityAuthorReaderMongooseAdapter } from '../infrastructure/community-author-reader-mongoose.adapter';
import { CommunityFollowReaderMongooseAdapter } from '../infrastructure/community-follow-reader-mongoose.adapter';
import { CommunityAssetUrlStorageAdapter } from '../infrastructure/community-asset-url-storage.adapter';
import { CommunityLikeMongooseAdapter } from '../infrastructure/community-like-mongoose.adapter';
import { CommunityBookmarkMongooseAdapter } from '../infrastructure/community-bookmark-mongoose.adapter';
import { CommunityPostMapperService } from '../domain/services/community-post-mapper.service';
import { COMMUNITY_POST_READER_PORT } from '../application/ports/community-post-reader.port';
import { COMMUNITY_AUTHOR_READER_PORT } from '../application/ports/community-author-reader.port';
import { COMMUNITY_FOLLOW_READER_PORT } from '../application/ports/community-follow-reader.port';
import { COMMUNITY_ASSET_URL_PORT } from '../application/ports/community-asset-url.port';
import { COMMUNITY_LIKE_PORT } from '../application/ports/community-like.port';
import { COMMUNITY_BOOKMARK_PORT } from '../application/ports/community-bookmark.port';

// 커뮤니티 공통 기반.
// 게시글 읽기(POST_READER)·작성자 조회·팔로우 관계·이미지 URL·좋아요/저장 상태는
// 목록/상세/상호작용 슬라이스가 모두 사용하므로 여기서 Port 로 노출한다.
const COMMUNITY_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: CommunityPost.name, schema: CommunityPostSchema },
    { name: CommunityPostComment.name, schema: CommunityPostCommentSchema },
    { name: CommunityPostLike.name, schema: CommunityPostLikeSchema },
    { name: CommunityPostReport.name, schema: CommunityPostReportSchema },
    { name: CommunityBookmark.name, schema: CommunityBookmarkSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: UserFollow.name, schema: UserFollowSchema },
]);

export const COMMUNITY_SHARED_MODULE_IMPORTS = [COMMUNITY_SHARED_SCHEMA_IMPORTS, StorageModule];

export const COMMUNITY_SHARED_MODULE_PROVIDERS = [
    CommunityRepository,
    CommunityLikeRepository,
    CommunityBookmarkRepository,
    CommunityPostReaderMongooseAdapter,
    CommunityAuthorReaderMongooseAdapter,
    CommunityFollowReaderMongooseAdapter,
    CommunityAssetUrlStorageAdapter,
    CommunityLikeMongooseAdapter,
    CommunityBookmarkMongooseAdapter,
    CommunityPostMapperService,
    { provide: COMMUNITY_POST_READER_PORT, useExisting: CommunityPostReaderMongooseAdapter },
    { provide: COMMUNITY_AUTHOR_READER_PORT, useExisting: CommunityAuthorReaderMongooseAdapter },
    { provide: COMMUNITY_FOLLOW_READER_PORT, useExisting: CommunityFollowReaderMongooseAdapter },
    { provide: COMMUNITY_ASSET_URL_PORT, useExisting: CommunityAssetUrlStorageAdapter },
    { provide: COMMUNITY_LIKE_PORT, useExisting: CommunityLikeMongooseAdapter },
    { provide: COMMUNITY_BOOKMARK_PORT, useExisting: CommunityBookmarkMongooseAdapter },
];

export const COMMUNITY_SHARED_MODULE_EXPORTS = [
    CommunityRepository,
    CommunityLikeRepository,
    CommunityBookmarkRepository,
    CommunityPostMapperService,
    COMMUNITY_POST_READER_PORT,
    COMMUNITY_AUTHOR_READER_PORT,
    COMMUNITY_FOLLOW_READER_PORT,
    COMMUNITY_ASSET_URL_PORT,
    COMMUNITY_LIKE_PORT,
    COMMUNITY_BOOKMARK_PORT,
    MongooseModule,
];
