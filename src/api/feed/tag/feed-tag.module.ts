import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema.js';
import { FeedTagService } from './feed-tag.service.js';
import { StorageModule } from '../../../common/storage/storage.module.js';

/**
 * 피드 태그 모듈
 * - 해시태그 검색
 * - 인기 태그 조회
 * - 태그 자동완성
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]), StorageModule],
    providers: [FeedTagService],
    exports: [FeedTagService],
})
export class FeedTagModule {}
