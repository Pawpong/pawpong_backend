import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiProduces, ApiQuery, getSchemaPath } from '@nestjs/swagger';

import { ApiPublicController, ApiRawEndpoint } from '../../../../common/decorator/swagger.decorator';
import { CreateCommentRequestDto, UpdateCommentRequestDto } from '../../comment/dto/request/comment-request.dto';
import {
    CommentCreateResponseDto,
    CommentListResponseDto,
    CommentUpdateResponseDto,
    ReplyListResponseDto,
} from '../../comment/dto/response/comment-response.dto';
import { LikeStatusResponseDto, LikeToggleResponseDto, MyLikedVideosResponseDto } from '../../like/dto/response/like-response.dto';
import { PopularTagItemDto, TagSearchResponseDto, TagSuggestionItemDto } from '../../tag/dto/response/tag-response.dto';
import { UploadVideoRequestDto } from '../dto/request/upload-video-request.dto';
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
} from '../dto/response/video-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import {
    FEED_COMMENT_NOT_FOUND_RESPONSE,
    FEED_STREAM_FAILURE_RESPONSE,
    FEED_TAG_REQUIRED_RESPONSE,
    FEED_VIDEO_ACCESS_DENIED_RESPONSE,
    FEED_VIDEO_NOT_FOUND_RESPONSE,
} from '../constants/feed-video-swagger.constants';

function ApiFeedVideoIdParam() {
    return ApiParam({
        name: 'videoId',
        description: '동영상 ID',
        example: '507f1f77bcf86cd799439011',
    });
}

function ApiFeedCommentIdParam() {
    return ApiParam({
        name: 'commentId',
        description: '댓글 ID',
        example: '507f1f77bcf86cd799439012',
    });
}

function ApiPageQuery(example: number = 1) {
    return ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: '페이지 번호',
        example,
    });
}

function ApiLimitQuery(example: number) {
    return ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: '조회 개수',
        example,
    });
}

export function ApiFeedVideoController() {
    return ApiPublicController('Feed');
}

export function ApiGetFeedVideosEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '동영상 피드 조회',
            description: `
                공개된 동영상 목록을 최신순으로 조회합니다.

                ## 주요 기능
                - 공개 상태인 동영상만 반환합니다.
                - page와 limit로 스크롤형 피드를 페이지네이션합니다.
            `,
            responseType: FeedResponseDto,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.feedListed,
        }),
        ApiPageQuery(),
        ApiLimitQuery(20),
    );
}

export function ApiGetPopularFeedVideosEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '인기 동영상 조회',
            description: `
                조회수 기준 인기 동영상을 조회합니다.

                ## 주요 기능
                - 캐시된 인기 동영상 데이터를 우선 사용합니다.
                - limit를 생략하면 기본 10개를 반환합니다.
            `,
            responseType: [PopularVideoItemDto],
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.popularVideosListed,
        }),
        ApiLimitQuery(10),
    );
}

export function ApiStreamFeedVideoEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: 'HLS 스트리밍 프록시',
            description: `
                S3에 저장된 HLS 파일을 프록시하여 재생에 필요한 manifest와 segment를 제공합니다.

                ## 주요 기능
                - m3u8 manifest와 ts segment를 모두 지원합니다.
                - 캐시된 파일이 있으면 Redis 캐시를 우선 사용합니다.
            `,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.hlsStreamReturned,
            responseSchema: {
                oneOf: [
                    { type: 'string', description: 'm3u8 manifest 본문' },
                    { type: 'string', format: 'binary', description: 'ts segment 바이너리' },
                ],
            },
            errorResponses: [FEED_STREAM_FAILURE_RESPONSE],
        }),
        ApiProduces('application/vnd.apple.mpegurl', 'video/mp2t'),
        ApiFeedVideoIdParam(),
        ApiParam({
            name: 'filename',
            description: 'manifest 또는 segment 파일명',
            example: 'playlist.m3u8',
        }),
    );
}

export function ApiPrefetchFeedVideoSegmentsEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: 'HLS 세그먼트 프리페치',
            description: `
                현재 세그먼트 기준으로 여러 화질의 세그먼트를 미리 캐시합니다.

                ## 주요 기능
                - 적응형 비트레이트 전환 시 끊김을 줄이기 위해 사용합니다.
                - count를 생략하면 기본 5개 세그먼트를 대상으로 합니다.
            `,
            responseType: SegmentPrefetchResponseDto,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.segmentsPrefetched,
            errorResponses: [FEED_VIDEO_NOT_FOUND_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
        ApiQuery({
            name: 'segment',
            required: true,
            type: Number,
            description: '현재 세그먼트 번호',
            example: 12,
        }),
        ApiQuery({
            name: 'count',
            required: false,
            type: Number,
            description: '프리페치할 세그먼트 수',
            example: 5,
        }),
    );
}

export function ApiGetFeedVideoMetaEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '동영상 상세 조회',
            description: `
                동영상 메타데이터와 재생 URL을 조회합니다.

                ## 주요 기능
                - 인코딩 완료 전에는 pending 메타데이터만 반환합니다.
                - READY 상태이면 HLS 재생 URL과 썸네일 URL을 함께 반환합니다.
            `,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videoMetaRetrieved,
            responseSchema: {
                oneOf: [
                    { $ref: getSchemaPath(VideoMetaResponseDto) },
                    { $ref: getSchemaPath(PendingVideoMetaResponseDto) },
                ],
            },
            additionalModels: [VideoMetaResponseDto, PendingVideoMetaResponseDto],
            errorResponses: [FEED_VIDEO_NOT_FOUND_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiIncrementFeedVideoViewEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '조회수 증가',
            description: `
                동영상 재생 시작 시 조회수를 증가시킵니다.

                ## 주요 기능
                - 조회수 증가는 비동기로 처리됩니다.
                - 메타 캐시를 비워 다음 조회에 최신 값이 반영되도록 합니다.
            `,
            responseType: VideoActionSuccessResponseDto,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videoViewIncremented,
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiGetFeedVideoUploadUrlEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '동영상 업로드 URL 발급',
            description: `
                클라이언트가 직접 스토리지로 업로드할 수 있는 Presigned URL을 발급합니다.

                ## 주요 기능
                - 업로드 대기 상태의 video 엔티티를 먼저 생성합니다.
                - 제목, 설명, 태그를 함께 저장해 이후 업로드 완료 시 이어집니다.
            `,
            responseType: UploadUrlResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.uploadUrlIssued,
        }),
        ApiBody({ type: UploadVideoRequestDto }),
    );
}

export function ApiCompleteFeedVideoUploadEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '업로드 완료 알림',
            description: `
                파일 업로드가 끝난 뒤 인코딩 작업을 시작합니다.

                ## 주요 기능
                - 업로드 소유자를 검증합니다.
                - BullMQ 인코딩 큐에 작업을 등록합니다.
            `,
            responseType: UploadCompleteResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.uploadCompleted,
            errorResponses: [FEED_VIDEO_NOT_FOUND_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiGetMyFeedVideosEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '내 동영상 목록 조회',
            description: `
                내가 업로드한 동영상 목록을 조회합니다.

                ## 주요 기능
                - processing, ready, failed 상태를 모두 포함합니다.
                - 페이지네이션 정보와 함께 반환합니다.
            `,
            responseType: MyVideoListResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.myVideosListed,
        }),
        ApiPageQuery(),
        ApiLimitQuery(20),
    );
}

export function ApiDeleteFeedVideoEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '동영상 삭제',
            description: `
                내가 업로드한 동영상을 삭제합니다.

                ## 주요 기능
                - 원본 파일, 썸네일, HLS 파일 등 관련 스토리지 파일을 함께 정리합니다.
                - 메타 캐시를 비워 즉시 반영되도록 합니다.
            `,
            responseType: VideoActionSuccessResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videoDeleted,
            errorResponses: [FEED_VIDEO_ACCESS_DENIED_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiToggleFeedVideoVisibilityEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '동영상 공개 상태 전환',
            description: `
                동영상의 공개/비공개 상태를 전환합니다.

                ## 주요 기능
                - 업로더 본인만 변경할 수 있습니다.
                - 공개 상태가 바뀌면 메타 캐시를 비웁니다.
            `,
            responseType: VideoVisibilityResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.visibilityToggled,
            errorResponses: [FEED_VIDEO_ACCESS_DENIED_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiToggleFeedVideoLikeEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '좋아요 토글',
            description: `
                동영상에 좋아요를 추가하거나 취소합니다.

                ## 주요 기능
                - 현재 좋아요 상태에 따라 생성 또는 삭제를 수행합니다.
                - 최신 좋아요 수를 함께 반환합니다.
            `,
            responseType: LikeToggleResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.likeToggled,
            errorResponses: [FEED_VIDEO_NOT_FOUND_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiGetFeedVideoLikeStatusEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '좋아요 상태 조회',
            description: `
                현재 사용자가 해당 동영상에 좋아요를 눌렀는지 조회합니다.

                ## 주요 기능
                - 현재 좋아요 여부와 총 좋아요 수를 함께 반환합니다.
            `,
            responseType: LikeStatusResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.likeStatusRetrieved,
        }),
        ApiFeedVideoIdParam(),
    );
}

export function ApiGetMyLikedFeedVideosEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '좋아요한 동영상 목록 조회',
            description: `
                내가 좋아요한 동영상 목록을 페이지네이션으로 조회합니다.

                ## 주요 기능
                - 업로더 정보와 썸네일 URL을 함께 반환합니다.
                - page와 limit로 스크롤형 목록을 조회합니다.
            `,
            responseType: MyLikedVideosResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.myLikedVideosListed,
        }),
        ApiPageQuery(),
        ApiLimitQuery(20),
    );
}

export function ApiCreateFeedVideoCommentEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '댓글 작성',
            description: `
                동영상에 댓글 또는 대댓글을 작성합니다.

                ## 주요 기능
                - parentId를 보내면 대댓글로 저장합니다.
                - 동영상 댓글 수를 함께 갱신합니다.
            `,
            responseType: CommentCreateResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.commentCreated,
            errorResponses: [FEED_COMMENT_NOT_FOUND_RESPONSE],
        }),
        ApiFeedVideoIdParam(),
        ApiBody({ type: CreateCommentRequestDto }),
    );
}

export function ApiGetFeedVideoCommentsEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '댓글 목록 조회',
            description: `
                동영상의 최상위 댓글 목록을 조회합니다.

                ## 주요 기능
                - 비로그인 사용자는 읽기 전용으로 조회할 수 있습니다.
                - 각 댓글의 대댓글 수와 내 댓글 여부를 함께 반환합니다.
            `,
            responseType: CommentListResponseDto,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.commentsListed,
        }),
        ApiFeedVideoIdParam(),
        ApiPageQuery(),
        ApiLimitQuery(20),
    );
}

export function ApiGetFeedVideoRepliesEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '대댓글 조회',
            description: `
                특정 댓글의 대댓글 목록을 조회합니다.

                ## 주요 기능
                - 비로그인 사용자도 조회할 수 있습니다.
                - 내 댓글 여부를 함께 반환합니다.
            `,
            responseType: ReplyListResponseDto,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.repliesListed,
        }),
        ApiFeedCommentIdParam(),
        ApiPageQuery(),
        ApiLimitQuery(20),
    );
}

export function ApiUpdateFeedVideoCommentEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '댓글 수정',
            description: `
                내가 작성한 댓글을 수정합니다.

                ## 주요 기능
                - 댓글 소유자만 수정할 수 있습니다.
                - 수정된 최신 댓글 내용을 반환합니다.
            `,
            responseType: CommentUpdateResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.commentUpdated,
            errorResponses: [FEED_COMMENT_NOT_FOUND_RESPONSE],
        }),
        ApiFeedCommentIdParam(),
        ApiBody({ type: UpdateCommentRequestDto }),
    );
}

export function ApiDeleteFeedVideoCommentEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '댓글 삭제',
            description: `
                내가 작성한 댓글을 삭제합니다.

                ## 주요 기능
                - soft delete로 처리합니다.
                - 동영상 댓글 수와 댓글 캐시를 함께 갱신합니다.
            `,
            responseType: VideoActionSuccessResponseDto,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.commentDeleted,
            errorResponses: [FEED_COMMENT_NOT_FOUND_RESPONSE],
        }),
        ApiFeedCommentIdParam(),
    );
}

export function ApiSearchFeedVideosByTagEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '해시태그 검색',
            description: `
                해시태그로 동영상을 검색합니다.

                ## 주요 기능
                - 입력한 태그는 정규화 후 검색합니다.
                - 검색 결과와 페이지네이션 정보를 함께 반환합니다.
            `,
            responseType: TagSearchResponseDto,
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videosSearchedByTag,
            errorResponses: [FEED_TAG_REQUIRED_RESPONSE],
        }),
        ApiQuery({
            name: 'tag',
            required: true,
            type: String,
            description: '검색할 해시태그',
            example: '강아지',
        }),
        ApiPageQuery(),
        ApiLimitQuery(20),
    );
}

export function ApiGetPopularFeedTagsEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '인기 해시태그 조회',
            description: `
                가장 많이 사용된 해시태그 목록을 조회합니다.

                ## 주요 기능
                - 태그별 동영상 수와 총 조회수를 함께 반환합니다.
                - limit를 생략하면 기본 20개를 반환합니다.
            `,
            responseType: [PopularTagItemDto],
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.popularTagsListed,
        }),
        ApiLimitQuery(20),
    );
}

export function ApiSuggestFeedTagsEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '태그 자동완성',
            description: `
                검색어에 맞는 태그를 자동완성으로 추천합니다.

                ## 주요 기능
                - 입력 문자열을 정규화한 뒤 prefix 기반으로 추천합니다.
                - 빈 검색어면 빈 배열을 반환합니다.
            `,
            responseType: [TagSuggestionItemDto],
            isPublic: true,
            successDescription: FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.tagSuggestionsListed,
        }),
        ApiQuery({
            name: 'q',
            required: true,
            type: String,
            description: '자동완성 검색어',
            example: '강',
        }),
        ApiLimitQuery(10),
    );
}
