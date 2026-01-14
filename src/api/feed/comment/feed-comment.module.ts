import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema.js';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema.js';
import { FeedCommentService } from './feed-comment.service.js';

/**
 * 피드 댓글 모듈
 * - 댓글 작성/수정/삭제
 * - 대댓글 기능
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Video.name, schema: VideoSchema },
            { name: VideoComment.name, schema: VideoCommentSchema },
        ]),
    ],
    providers: [FeedCommentService],
    exports: [FeedCommentService],
})
export class FeedCommentModule {}
