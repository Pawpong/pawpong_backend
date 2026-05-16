import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import {
    CommunityPostComment,
    CommunityPostCommentSchema,
} from '../../schema/community-post-comment.schema';
import {
    CommunityPost,
    CommunityPostSchema,
} from '../../schema/community-post.schema';

import { COMMUNITY_ASSET_URL_PORT } from './application/ports/community-asset-url.port';
import { COMMUNITY_AUTHOR_READER_PORT } from './application/ports/community-author-reader.port';
import { COMMUNITY_POST_READER_PORT } from './application/ports/community-post-reader.port';
import { COMMUNITY_POST_WRITER_PORT } from './application/ports/community-post-writer.port';
import { CreateCommunityPostUseCase } from './application/use-cases/create-community-post.use-case';
import { DeleteCommunityPostUseCase } from './application/use-cases/delete-community-post.use-case';
import { GetCommunityPostCommentsUseCase } from './application/use-cases/get-community-post-comments.use-case';
import { GetCommunityPostDetailUseCase } from './application/use-cases/get-community-post-detail.use-case';
import { GetCommunityPostListUseCase } from './application/use-cases/get-community-post-list.use-case';
import { UpdateCommunityPostUseCase } from './application/use-cases/update-community-post.use-case';
import { CommunityPostDetailController } from './controller/community-post-detail.controller';
import { CommunityPostListController } from './controller/community-post-list.controller';
import { CommunityPostWriteController } from './controller/community-post-write.controller';
import { CommunityPostMapperService } from './domain/services/community-post-mapper.service';
import { CommunityPostWriteValidatorService } from './domain/services/community-post-write-validator.service';
import { CommunityAssetUrlStorageAdapter } from './infrastructure/community-asset-url-storage.adapter';
import { CommunityAuthorReaderMongooseAdapter } from './infrastructure/community-author-reader-mongoose.adapter';
import { CommunityPostReaderMongooseAdapter } from './infrastructure/community-post-reader-mongoose.adapter';
import { CommunityPostWriterMongooseAdapter } from './infrastructure/community-post-writer-mongoose.adapter';
import { CommunityRepository } from './repository/community.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: CommunityPost.name, schema: CommunityPostSchema },
    { name: CommunityPostComment.name, schema: CommunityPostCommentSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const COMMUNITY_MODULE_IMPORTS = [SCHEMA_IMPORTS, StorageModule];

export const COMMUNITY_MODULE_CONTROLLERS = [
    CommunityPostListController,
    CommunityPostDetailController,
    CommunityPostWriteController,
];

const USE_CASE_PROVIDERS = [
    GetCommunityPostListUseCase,
    GetCommunityPostDetailUseCase,
    GetCommunityPostCommentsUseCase,
    CreateCommunityPostUseCase,
    UpdateCommunityPostUseCase,
    DeleteCommunityPostUseCase,
];

const DOMAIN_PROVIDERS = [CommunityPostMapperService, CommunityPostWriteValidatorService];

const INFRASTRUCTURE_PROVIDERS = [
    CommunityRepository,
    CommunityPostReaderMongooseAdapter,
    CommunityPostWriterMongooseAdapter,
    CommunityAuthorReaderMongooseAdapter,
    CommunityAssetUrlStorageAdapter,
];

const PORT_BINDINGS = [
    { provide: COMMUNITY_POST_READER_PORT, useExisting: CommunityPostReaderMongooseAdapter },
    { provide: COMMUNITY_POST_WRITER_PORT, useExisting: CommunityPostWriterMongooseAdapter },
    { provide: COMMUNITY_AUTHOR_READER_PORT, useExisting: CommunityAuthorReaderMongooseAdapter },
    { provide: COMMUNITY_ASSET_URL_PORT, useExisting: CommunityAssetUrlStorageAdapter },
];

export const COMMUNITY_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
