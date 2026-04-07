import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Body,
    Query,
    Res,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UploadVideoRequestDto } from './dto/request/upload-video-request.dto';
import { CreateCommentRequestDto, UpdateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import {
    FeedResponseDto,
    MyVideoListResponseDto,
    PendingVideoMetaResponseDto,
    PopularVideoItemDto,
    SegmentPrefetchResponseDto,
    UploadCompleteResponseDto,
    UploadUrlResponseDto,
    VideoActionSuccessResponseDto,
    VideoMetaResponseDto,
    VideoVisibilityResponseDto,
} from './dto/response/video-response.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ToggleLikeUseCase } from '../like/application/use-cases/toggle-like.use-case';
import { GetLikeStatusUseCase } from '../like/application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from '../like/application/use-cases/get-my-liked-videos.use-case';
import { LikeStatusResponseDto, LikeToggleResponseDto, MyLikedVideosResponseDto } from '../like/dto/response/like-response.dto';
import { CreateCommentUseCase } from '../comment/application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from '../comment/application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from '../comment/application/use-cases/get-replies.use-case';
import { UpdateCommentUseCase } from '../comment/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../comment/application/use-cases/delete-comment.use-case';
import {
    CommentCreateResponseDto,
    CommentListResponseDto,
    CommentUpdateResponseDto,
    ReplyListResponseDto,
} from '../comment/dto/response/comment-response.dto';
import { SearchByTagUseCase } from '../tag/application/use-cases/search-by-tag.use-case';
import { GetPopularTagsUseCase } from '../tag/application/use-cases/get-popular-tags.use-case';
import { SuggestTagsUseCase } from '../tag/application/use-cases/suggest-tags.use-case';
import { PopularTagItemDto, TagSearchResponseDto, TagSuggestionItemDto } from '../tag/dto/response/tag-response.dto';
import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import { GetPopularVideosUseCase } from './application/use-cases/get-popular-videos.use-case';
import { GetVideoMetaUseCase } from './application/use-cases/get-video-meta.use-case';
import { GetUploadUrlUseCase } from './application/use-cases/get-upload-url.use-case';
import { CompleteUploadUseCase } from './application/use-cases/complete-upload.use-case';
import { GetMyVideosUseCase } from './application/use-cases/get-my-videos.use-case';
import { DeleteVideoUseCase } from './application/use-cases/delete-video.use-case';
import { ToggleVideoVisibilityUseCase } from './application/use-cases/toggle-video-visibility.use-case';
import { IncrementViewCountUseCase } from './application/use-cases/increment-view-count.use-case';
import { ProxyHlsFileUseCase } from './application/use-cases/proxy-hls-file.use-case';
import { PrefetchAllQualitySegmentsUseCase } from './application/use-cases/prefetch-all-quality-segments.use-case';
import {
    ApiCompleteFeedVideoUploadEndpoint,
    ApiCreateFeedVideoCommentEndpoint,
    ApiDeleteFeedVideoCommentEndpoint,
    ApiDeleteFeedVideoEndpoint,
    ApiFeedVideoController,
    ApiGetFeedVideoCommentsEndpoint,
    ApiGetFeedVideoLikeStatusEndpoint,
    ApiGetFeedVideoMetaEndpoint,
    ApiGetFeedVideoUploadUrlEndpoint,
    ApiGetFeedVideosEndpoint,
    ApiGetMyFeedVideosEndpoint,
    ApiGetMyLikedFeedVideosEndpoint,
    ApiGetPopularFeedTagsEndpoint,
    ApiGetPopularFeedVideosEndpoint,
    ApiGetFeedVideoRepliesEndpoint,
    ApiIncrementFeedVideoViewEndpoint,
    ApiPrefetchFeedVideoSegmentsEndpoint,
    ApiSearchFeedVideosByTagEndpoint,
    ApiStreamFeedVideoEndpoint,
    ApiSuggestFeedTagsEndpoint,
    ApiToggleFeedVideoLikeEndpoint,
    ApiToggleFeedVideoVisibilityEndpoint,
    ApiUpdateFeedVideoCommentEndpoint,
} from './swagger';

/**
 * 피드 동영상 API 컨트롤러
 * 인스타그램/틱톡 스타일의 피드형 동영상 서비스
 */
@ApiFeedVideoController()
@Controller('feed')
export class FeedVideoController {
    constructor(
        private readonly getFeedUseCase: GetFeedUseCase,
        private readonly getPopularVideosUseCase: GetPopularVideosUseCase,
        private readonly getVideoMetaUseCase: GetVideoMetaUseCase,
        private readonly getUploadUrlUseCase: GetUploadUrlUseCase,
        private readonly completeUploadUseCase: CompleteUploadUseCase,
        private readonly getMyVideosUseCase: GetMyVideosUseCase,
        private readonly deleteVideoUseCase: DeleteVideoUseCase,
        private readonly toggleVideoVisibilityUseCase: ToggleVideoVisibilityUseCase,
        private readonly incrementViewCountUseCase: IncrementViewCountUseCase,
        private readonly proxyHlsFileUseCase: ProxyHlsFileUseCase,
        private readonly prefetchAllQualitySegmentsUseCase: PrefetchAllQualitySegmentsUseCase,
        private readonly toggleLikeUseCase: ToggleLikeUseCase,
        private readonly getLikeStatusUseCase: GetLikeStatusUseCase,
        private readonly getMyLikedVideosUseCase: GetMyLikedVideosUseCase,
        private readonly createCommentUseCase: CreateCommentUseCase,
        private readonly getCommentsUseCase: GetCommentsUseCase,
        private readonly getRepliesUseCase: GetRepliesUseCase,
        private readonly updateCommentUseCase: UpdateCommentUseCase,
        private readonly deleteCommentUseCase: DeleteCommentUseCase,
        private readonly searchByTagUseCase: SearchByTagUseCase,
        private readonly getPopularTagsUseCase: GetPopularTagsUseCase,
        private readonly suggestTagsUseCase: SuggestTagsUseCase,
    ) {}

    // =========================================================================
    // 공개 API (인증 불필요)
    // =========================================================================

    /**
     * 동영상 피드 조회 (최신순)
     */
    @Get('videos')
    @ApiGetFeedVideosEndpoint()
    async getFeed(@Query('page') page: number = 1, @Query('limit') limit: number = 20): Promise<FeedResponseDto> {
        return this.getFeedUseCase.execute(Number(page), Number(limit));
    }

    /**
     * 인기 동영상 조회
     */
    @Get('videos/popular')
    @ApiGetPopularFeedVideosEndpoint()
    async getPopularVideos(@Query('limit') limit: number = 10): Promise<PopularVideoItemDto[]> {
        return this.getPopularVideosUseCase.execute(Number(limit));
    }

    /**
     * HLS 스트리밍 프록시 (CORS 우회)
     */
    @Get('videos/stream/:videoId/:filename')
    @ApiStreamFeedVideoEndpoint()
    async streamHLS(@Param('videoId') videoId: string, @Param('filename') filename: string, @Res() res: Response) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        try {
            const proxyResponse = await this.proxyHlsFileUseCase.execute(videoId, filename);

            res.setHeader('Content-Type', proxyResponse.contentType);
            res.setHeader('X-Cache', proxyResponse.cacheStatus);
            res.setHeader('Cache-Control', proxyResponse.cacheControl);

            return res.send(proxyResponse.body);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('파일을 가져올 수 없습니다.');
        }
    }

    /**
     * HLS 세그먼트 프리페치 (ABR 최적화)
     * 특정 시간대의 모든 화질 세그먼트를 미리 캐싱
     */
    @Post('videos/stream/:videoId/prefetch')
    @ApiPrefetchFeedVideoSegmentsEndpoint()
    async prefetchSegments(
        @Param('videoId') videoId: string,
        @Query('segment') segment: number,
        @Query('count') count: number = 5,
    ): Promise<SegmentPrefetchResponseDto> {
        await this.prefetchAllQualitySegmentsUseCase.execute(videoId, Number(segment), Number(count));
        return { success: true, message: `${count}개 세그먼트 프리페치 완료` };
    }

    /**
     * 동영상 상세 조회
     */
    @Get('videos/:videoId')
    @ApiGetFeedVideoMetaEndpoint()
    async getVideoMeta(@Param('videoId') videoId: string): Promise<VideoMetaResponseDto | PendingVideoMetaResponseDto> {
        return this.getVideoMetaUseCase.execute(videoId);
    }

    /**
     * 조회수 증가
     */
    @Post('videos/:videoId/view')
    @ApiIncrementFeedVideoViewEndpoint()
    async incrementView(@Param('videoId') videoId: string): Promise<VideoActionSuccessResponseDto> {
        await this.incrementViewCountUseCase.execute(videoId);
        return { success: true };
    }

    // =========================================================================
    // 인증 필요 API
    // =========================================================================

    /**
     * 동영상 업로드 URL 발급
     */
    @Post('videos/upload-url')
    @UseGuards(JwtAuthGuard)
    @ApiGetFeedVideoUploadUrlEndpoint()
    async getUploadUrl(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() dto: UploadVideoRequestDto,
    ): Promise<UploadUrlResponseDto> {
        return this.getUploadUrlUseCase.execute(
            userId,
            role === 'breeder' ? 'Breeder' : 'Adopter',
            dto.title,
            dto.description,
            dto.tags,
        );
    }

    /**
     * 업로드 완료 알림 (인코딩 시작)
     */
    @Post('videos/:videoId/upload-complete')
    @UseGuards(JwtAuthGuard)
    @ApiCompleteFeedVideoUploadEndpoint()
    async completeUpload(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<UploadCompleteResponseDto> {
        return this.completeUploadUseCase.execute(videoId, userId);
    }

    /**
     * 내 동영상 목록 조회
     */
    @Get('videos/my/list')
    @UseGuards(JwtAuthGuard)
    @ApiGetMyFeedVideosEndpoint()
    async getMyVideos(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<MyVideoListResponseDto> {
        return this.getMyVideosUseCase.execute(userId, Number(page), Number(limit));
    }

    /**
     * 동영상 삭제
     */
    @Delete('videos/:videoId')
    @UseGuards(JwtAuthGuard)
    @ApiDeleteFeedVideoEndpoint()
    async deleteVideo(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        return this.deleteVideoUseCase.execute(videoId, userId);
    }

    /**
     * 동영상 공개/비공개 전환
     */
    @Patch('videos/:videoId/visibility')
    @UseGuards(JwtAuthGuard)
    @ApiToggleFeedVideoVisibilityEndpoint()
    async toggleVisibility(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoVisibilityResponseDto> {
        return this.toggleVideoVisibilityUseCase.execute(videoId, userId);
    }

    // =========================================================================
    // 좋아요 API
    // =========================================================================

    /**
     * 좋아요 토글 (좋아요/좋아요 취소)
     */
    @Post('like/:videoId')
    @UseGuards(JwtAuthGuard)
    @ApiToggleFeedVideoLikeEndpoint()
    async toggleLike(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<LikeToggleResponseDto> {
        return this.toggleLikeUseCase.execute(videoId, userId, role === 'breeder' ? 'Breeder' : 'Adopter');
    }

    /**
     * 좋아요 상태 확인
     */
    @Get('like/:videoId/status')
    @UseGuards(JwtAuthGuard)
    @ApiGetFeedVideoLikeStatusEndpoint()
    async getLikeStatus(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<LikeStatusResponseDto> {
        return this.getLikeStatusUseCase.execute(videoId, userId);
    }

    /**
     * 내가 좋아요한 동영상 목록
     */
    @Get('like/my/list')
    @UseGuards(JwtAuthGuard)
    @ApiGetMyLikedFeedVideosEndpoint()
    async getMyLikedVideos(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<MyLikedVideosResponseDto> {
        return this.getMyLikedVideosUseCase.execute(userId, Number(page), Number(limit));
    }

    // =========================================================================
    // 댓글 API
    // =========================================================================

    /**
     * 댓글 작성
     */
    @Post('comment/:videoId')
    @UseGuards(JwtAuthGuard)
    @ApiCreateFeedVideoCommentEndpoint()
    async createComment(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() dto: CreateCommentRequestDto,
    ): Promise<CommentCreateResponseDto> {
        return this.createCommentUseCase.execute(
            videoId,
            userId,
            role === 'breeder' ? 'Breeder' : 'Adopter',
            dto.content,
            dto.parentId,
        );
    }

    /**
     * 댓글 목록 조회
     */
    @Get('comment/:videoId')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiGetFeedVideoCommentsEndpoint()
    async getComments(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<CommentListResponseDto> {
        return this.getCommentsUseCase.execute(videoId, userId, Number(page), Number(limit));
    }

    /**
     * 대댓글 조회
     */
    @Get('comment/:commentId/replies')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiGetFeedVideoRepliesEndpoint()
    async getReplies(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<ReplyListResponseDto> {
        return this.getRepliesUseCase.execute(commentId, userId, Number(page), Number(limit));
    }

    /**
     * 댓글 수정
     */
    @Patch('comment/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiUpdateFeedVideoCommentEndpoint()
    async updateComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateCommentRequestDto,
    ): Promise<CommentUpdateResponseDto> {
        return this.updateCommentUseCase.execute(commentId, userId, dto.content);
    }

    /**
     * 댓글 삭제
     */
    @Delete('comment/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiDeleteFeedVideoCommentEndpoint()
    async deleteComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        return this.deleteCommentUseCase.execute(commentId, userId);
    }

    // =========================================================================
    // 해시태그 검색 API
    // =========================================================================

    /**
     * 해시태그로 동영상 검색
     */
    @Get('tag/search')
    @ApiSearchFeedVideosByTagEndpoint()
    async searchByTag(
        @Query('tag') tag: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<TagSearchResponseDto> {
        if (!tag) {
            throw new BadRequestException('검색할 태그를 입력해주세요.');
        }

        return this.searchByTagUseCase.execute(tag, Number(page), Number(limit));
    }

    /**
     * 인기 해시태그 목록
     */
    @Get('tag/popular')
    @ApiGetPopularFeedTagsEndpoint()
    async getPopularTags(@Query('limit') limit: number = 20): Promise<PopularTagItemDto[]> {
        return this.getPopularTagsUseCase.execute(Number(limit));
    }

    /**
     * 태그 자동완성
     */
    @Get('tag/suggest')
    @ApiSuggestFeedTagsEndpoint()
    async suggestTags(@Query('q') query: string, @Query('limit') limit: number = 10): Promise<TagSuggestionItemDto[]> {
        if (!query) {
            return [];
        }

        return this.suggestTagsUseCase.execute(query, Number(limit));
    }
}
