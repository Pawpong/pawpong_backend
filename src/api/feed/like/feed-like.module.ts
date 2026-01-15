import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema.js';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema.js';
import { FeedLikeService } from './feed-like.service.js';
import { StorageModule } from '../../../common/storage/storage.module.js';

/**
 * 피드 좋아요 모듈
 * - 좋아요 토글
 * - 좋아요 상태 확인
 * - 좋아요한 동영상 목록
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Video.name, schema: VideoSchema },
            { name: VideoLike.name, schema: VideoLikeSchema },
        ]),
        StorageModule,
    ],
    providers: [FeedLikeService],
    exports: [FeedLikeService],
})
export class FeedLikeModule {}
