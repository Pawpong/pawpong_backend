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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UploadVideoRequestDto } from './dto/request/upload-video-request.dto';
import { CreateCommentRequestDto, UpdateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import { UploadUrlResponseDto, VideoMetaResponseDto, FeedResponseDto } from './dto/response/video-response.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ToggleLikeUseCase } from '../like/application/use-cases/toggle-like.use-case';
import { GetLikeStatusUseCase } from '../like/application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from '../like/application/use-cases/get-my-liked-videos.use-case';
import { CreateCommentUseCase } from '../comment/application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from '../comment/application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from '../comment/application/use-cases/get-replies.use-case';
import { UpdateCommentUseCase } from '../comment/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../comment/application/use-cases/delete-comment.use-case';
import { SearchByTagUseCase } from '../tag/application/use-cases/search-by-tag.use-case';
import { GetPopularTagsUseCase } from '../tag/application/use-cases/get-popular-tags.use-case';
import { SuggestTagsUseCase } from '../tag/application/use-cases/suggest-tags.use-case';
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

/**
 * 피드 동영상 API 컨트롤러
 * 인스타그램/틱톡 스타일의 피드형 동영상 서비스
 */
@ApiTags('Feed')
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
    @ApiOperation({
        summary: '동영상 피드 조회',
        description: '공개된 동영상 목록을 최신순으로 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '피드 조회 성공', type: FeedResponseDto })
    async getFeed(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        return this.getFeedUseCase.execute(Number(page), Number(limit));
    }

    /**
     * 인기 동영상 조회
     */
    @Get('videos/popular')
    @ApiOperation({
        summary: '인기 동영상 조회',
        description: '조회수 기준 인기 동영상을 조회합니다.',
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiResponse({ status: 200, description: '인기 동영상 조회 성공' })
    async getPopularVideos(@Query('limit') limit: number = 10) {
        return this.getPopularVideosUseCase.execute(Number(limit));
    }

    /**
     * HLS 스트리밍 프록시 (CORS 우회)
     */
    @Get('videos/stream/:videoId/:filename')
    @ApiOperation({
        summary: 'HLS 스트리밍 프록시',
        description: 'S3의 HLS 파일을 프록시하여 CORS 문제를 해결합니다.',
    })
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
    @ApiOperation({
        summary: 'HLS 세그먼트 프리페치',
        description: '현재 재생 위치 기준으로 모든 화질의 세그먼트를 미리 캐싱합니다. 화질 전환 시 끊김 방지.',
    })
    @ApiQuery({ name: 'segment', required: true, type: Number, description: '현재 세그먼트 번호' })
    @ApiQuery({ name: 'count', required: false, type: Number, description: '프리페치할 세그먼트 수 (기본 5)' })
    async prefetchSegments(
        @Param('videoId') videoId: string,
        @Query('segment') segment: number,
        @Query('count') count: number = 5,
    ) {
        await this.prefetchAllQualitySegmentsUseCase.execute(videoId, Number(segment), Number(count));
        return { success: true, message: `${count}개 세그먼트 프리페치 완료` };
    }

    /**
     * 동영상 상세 조회
     */
    @Get('videos/:videoId')
    @ApiOperation({
        summary: '동영상 상세 조회',
        description: '동영상 메타데이터와 재생 URL을 조회합니다.',
    })
    @ApiResponse({ status: 200, description: '조회 성공', type: VideoMetaResponseDto })
    @ApiResponse({ status: 400, description: '동영상을 찾을 수 없음' })
    async getVideoMeta(@Param('videoId') videoId: string) {
        return this.getVideoMetaUseCase.execute(videoId);
    }

    /**
     * 조회수 증가
     */
    @Post('videos/:videoId/view')
    @ApiOperation({
        summary: '조회수 증가',
        description: '동영상 재생 시작 시 호출하여 조회수를 증가시킵니다.',
    })
    @ApiResponse({ status: 200, description: '조회수 증가 성공' })
    async incrementView(@Param('videoId') videoId: string) {
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
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '동영상 업로드 URL 발급',
        description: '클라이언트가 직접 S3로 업로드할 수 있는 Presigned URL을 발급합니다. (10분 유효)',
    })
    @ApiResponse({
        status: 200,
        description: 'URL 발급 성공',
        type: UploadUrlResponseDto,
    })
    async getUploadUrl(@CurrentUser() user: any, @Body() dto: UploadVideoRequestDto) {
        return this.getUploadUrlUseCase.execute(
            this.getRequiredUserId(user),
            this.getUserModel(user),
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
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '업로드 완료 알림',
        description: '클라이언트가 S3 업로드 완료 후 호출하면 인코딩 작업을 시작합니다.',
    })
    @ApiResponse({ status: 200, description: '인코딩 시작됨' })
    @ApiResponse({ status: 400, description: '동영상을 찾을 수 없음' })
    async completeUpload(@Param('videoId') videoId: string, @CurrentUser() user: any) {
        return this.completeUploadUseCase.execute(videoId, this.getRequiredUserId(user));
    }

    /**
     * 내 동영상 목록 조회
     */
    @Get('videos/my/list')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '내 동영상 목록',
        description: '내가 업로드한 동영상 목록을 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '조회 성공' })
    async getMyVideos(@CurrentUser() user: any, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        return this.getMyVideosUseCase.execute(this.getRequiredUserId(user), Number(page), Number(limit));
    }

    /**
     * 동영상 삭제
     */
    @Delete('videos/:videoId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '동영상 삭제',
        description: '내가 업로드한 동영상을 삭제합니다.',
    })
    @ApiResponse({ status: 200, description: '삭제 성공' })
    @ApiResponse({ status: 400, description: '동영상을 찾을 수 없음 또는 권한 없음' })
    async deleteVideo(@Param('videoId') videoId: string, @CurrentUser() user: any) {
        return this.deleteVideoUseCase.execute(videoId, this.getRequiredUserId(user));
    }

    /**
     * 동영상 공개/비공개 전환
     */
    @Patch('videos/:videoId/visibility')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '공개 상태 전환',
        description: '동영상의 공개/비공개 상태를 전환합니다.',
    })
    @ApiResponse({ status: 200, description: '전환 성공' })
    async toggleVisibility(@Param('videoId') videoId: string, @CurrentUser() user: any) {
        return this.toggleVideoVisibilityUseCase.execute(videoId, this.getRequiredUserId(user));
    }

    // =========================================================================
    // 좋아요 API
    // =========================================================================

    /**
     * 좋아요 토글 (좋아요/좋아요 취소)
     */
    @Post('like/:videoId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '좋아요 토글',
        description: '동영상에 좋아요를 추가하거나 취소합니다.',
    })
    @ApiResponse({ status: 200, description: '좋아요 토글 성공' })
    async toggleLike(@Param('videoId') videoId: string, @CurrentUser() user: any) {
        return this.toggleLikeUseCase.execute(videoId, this.getRequiredUserId(user), this.getUserModel(user));
    }

    /**
     * 좋아요 상태 확인
     */
    @Get('like/:videoId/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '좋아요 상태 확인',
        description: '해당 동영상에 좋아요를 눌렀는지 확인합니다.',
    })
    @ApiResponse({ status: 200, description: '상태 조회 성공' })
    async getLikeStatus(@Param('videoId') videoId: string, @CurrentUser() user: any) {
        return this.getLikeStatusUseCase.execute(videoId, this.getRequiredUserId(user));
    }

    /**
     * 내가 좋아요한 동영상 목록
     */
    @Get('like/my/list')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '내가 좋아요한 동영상',
        description: '내가 좋아요한 동영상 목록을 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '조회 성공' })
    async getMyLikedVideos(
        @CurrentUser() user: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.getMyLikedVideosUseCase.execute(this.getRequiredUserId(user), Number(page), Number(limit));
    }

    // =========================================================================
    // 댓글 API
    // =========================================================================

    /**
     * 댓글 작성
     */
    @Post('comment/:videoId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '댓글 작성',
        description: '동영상에 댓글을 작성합니다. parentId를 넣으면 대댓글이 됩니다.',
    })
    @ApiResponse({ status: 200, description: '댓글 작성 성공' })
    async createComment(
        @Param('videoId') videoId: string,
        @CurrentUser() user: any,
        @Body() dto: CreateCommentRequestDto,
    ) {
        return this.createCommentUseCase.execute(
            videoId,
            this.getRequiredUserId(user),
            this.getUserModel(user),
            dto.content,
            dto.parentId,
        );
    }

    /**
     * 댓글 목록 조회
     */
    @Get('comment/:videoId')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({
        summary: '댓글 목록 조회',
        description: '동영상의 댓글 목록을 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '조회 성공' })
    async getComments(
        @Param('videoId') videoId: string,
        @CurrentUser() user: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.getCommentsUseCase.execute(videoId, user?.userId, Number(page), Number(limit));
    }

    /**
     * 대댓글 조회
     */
    @Get('comment/:commentId/replies')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({
        summary: '대댓글 조회',
        description: '특정 댓글의 대댓글 목록을 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '조회 성공' })
    async getReplies(
        @Param('commentId') commentId: string,
        @CurrentUser() user: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.getRepliesUseCase.execute(commentId, user?.userId, Number(page), Number(limit));
    }

    /**
     * 댓글 수정
     */
    @Patch('comment/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '댓글 수정',
        description: '내가 작성한 댓글을 수정합니다.',
    })
    @ApiResponse({ status: 200, description: '수정 성공' })
    async updateComment(
        @Param('commentId') commentId: string,
        @CurrentUser() user: any,
        @Body() dto: UpdateCommentRequestDto,
    ) {
        return this.updateCommentUseCase.execute(commentId, this.getRequiredUserId(user), dto.content);
    }

    /**
     * 댓글 삭제
     */
    @Delete('comment/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-Auth')
    @ApiOperation({
        summary: '댓글 삭제',
        description: '내가 작성한 댓글을 삭제합니다.',
    })
    @ApiResponse({ status: 200, description: '삭제 성공' })
    async deleteComment(@Param('commentId') commentId: string, @CurrentUser() user: any) {
        return this.deleteCommentUseCase.execute(commentId, this.getRequiredUserId(user));
    }

    // =========================================================================
    // 해시태그 검색 API
    // =========================================================================

    /**
     * 해시태그로 동영상 검색
     */
    @Get('tag/search')
    @ApiOperation({
        summary: '해시태그 검색',
        description: '해시태그로 동영상을 검색합니다.',
    })
    @ApiQuery({ name: 'tag', required: true, type: String, example: '강아지' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '검색 성공' })
    async searchByTag(@Query('tag') tag: string, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        if (!tag) {
            throw new BadRequestException('검색할 태그를 입력해주세요.');
        }

        return this.searchByTagUseCase.execute(tag, Number(page), Number(limit));
    }

    /**
     * 인기 해시태그 목록
     */
    @Get('tag/popular')
    @ApiOperation({
        summary: '인기 해시태그',
        description: '가장 많이 사용된 해시태그 목록을 조회합니다.',
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: '조회 성공' })
    async getPopularTags(@Query('limit') limit: number = 20) {
        return this.getPopularTagsUseCase.execute(Number(limit));
    }

    /**
     * 태그 자동완성
     */
    @Get('tag/suggest')
    @ApiOperation({
        summary: '태그 자동완성',
        description: '검색어에 맞는 태그를 추천합니다.',
    })
    @ApiQuery({ name: 'q', required: true, type: String, example: '강' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiResponse({ status: 200, description: '조회 성공' })
    async suggestTags(@Query('q') query: string, @Query('limit') limit: number = 10) {
        if (!query) {
            return [];
        }

        return this.suggestTagsUseCase.execute(query, Number(limit));
    }

    private getRequiredUserId(user: any): string {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }

        return user.userId;
    }

    private getUserModel(user: any): 'Breeder' | 'Adopter' {
        return user?.role === 'breeder' ? 'Breeder' : 'Adopter';
    }
}
