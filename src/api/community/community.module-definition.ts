import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import {
    CommunityPostComment,
    CommunityPostCommentSchema,
} from '../../schema/community-post-comment.schema';
import {
    CommunityPost,
    CommunityPostSchema,
} from '../../schema/community-post.schema';

import { COMMUNITY_ASSET_URL_PORT } from './application/ports/community-asset-url.port';
import { COMMUNITY_POST_READER_PORT } from './application/ports/community-post-reader.port';
import { GetCommunityPostCommentsUseCase } from './application/use-cases/get-community-post-comments.use-case';
import { GetCommunityPostDetailUseCase } from './application/use-cases/get-community-post-detail.use-case';
import { GetCommunityPostListUseCase } from './application/use-cases/get-community-post-list.use-case';
import { CommunityPostDetailController } from './community-post-detail.controller';
import { CommunityPostListController } from './community-post-list.controller';
import { CommunityPostMapperService } from './domain/services/community-post-mapper.service';
import { CommunityAssetUrlStorageAdapter } from './infrastructure/community-asset-url-storage.adapter';
import { CommunityPostReaderMongooseAdapter } from './infrastructure/community-post-reader-mongoose.adapter';
import { CommunityRepository } from './repository/community.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: CommunityPost.name, schema: CommunityPostSchema },
    { name: CommunityPostComment.name, schema: CommunityPostCommentSchema },
]);

export const COMMUNITY_MODULE_IMPORTS = [SCHEMA_IMPORTS, StorageModule];

export const COMMUNITY_MODULE_CONTROLLERS = [
    CommunityPostListController,
    CommunityPostDetailController,
];

const USE_CASE_PROVIDERS = [
    GetCommunityPostListUseCase,
    GetCommunityPostDetailUseCase,
    GetCommunityPostCommentsUseCase,
];

const DOMAIN_PROVIDERS = [CommunityPostMapperService];

const INFRASTRUCTURE_PROVIDERS = [
    CommunityRepository,
    CommunityPostReaderMongooseAdapter,
    CommunityAssetUrlStorageAdapter,
];

const PORT_BINDINGS = [
    { provide: COMMUNITY_POST_READER_PORT, useExisting: CommunityPostReaderMongooseAdapter },
    { provide: COMMUNITY_ASSET_URL_PORT, useExisting: CommunityAssetUrlStorageAdapter },
];

export const COMMUNITY_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
