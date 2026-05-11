import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
    ApiPublicController,
} from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityPostCardResponseDto } from '../dto/response/community-post-card.dto';
import { CommunityPostCommentResponseDto } from '../dto/response/community-post-comment.dto';
import { CommunityPostDeleteResponseDto } from '../dto/response/community-post-delete-response.dto';
import { CommunityPostDetailResponseDto } from '../dto/response/community-post-detail.dto';

const POST_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '게시글 없음',
    errorExample: '해당 게시글을 찾을 수 없습니다.',
} as const;

export function ApiCommunityPublicController() {
    return ApiPublicController('커뮤니티 (v2)');
}

export function ApiGetCommunityPostListEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '커뮤니티 게시글 목록',
            description: `
                Figma 21:2 — 커뮤니티 메인 피드.

                ## 필터 / 정렬
                - petType (선택): dog / cat / reptile
                - category (선택): 자유 텍스트 정확 일치 (예: "레오파드")
                - sort: latest(기본) / popular(likeCount desc)

                ## 응답
                - 카드 단위: 본문 발췌(최대 120자) + 첫 사진 primary URL + 전체 사진 URL 배열
                - 카테고리 사이드바 카운트는 별도 endpoint (이번 slice 미포함)
            `,
            responseType: PaginationResponseDto,
            itemType: CommunityPostCardResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '커뮤니티 게시글 목록 조회 성공',
            successMessageExample: COMMUNITY_RESPONSE_MESSAGES.listRetrieved,
        }),
    );
}

export function ApiGetCommunityPostDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '커뮤니티 게시글 상세',
            description: `
                Figma 315:5433 — 게시글 상세.

                ## 응답
                - 본문 전문 + 사진 signed URL 배열
                - commentPreview: 첫 5개 댓글 (더 보기는 GET /:postId/comments 페이지네이션)
            `,
            responseType: CommunityPostDetailResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '커뮤니티 게시글 상세 조회 성공',
            successMessageExample: COMMUNITY_RESPONSE_MESSAGES.detailRetrieved,
            errorResponses: [POST_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'postId', description: '게시글 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiGetCommunityPostCommentsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '커뮤니티 게시글 댓글 페이지네이션',
            description: `
                작성일 asc 정렬 (오래된 댓글이 먼저). 답글(parentCommentId 있음)도 같은 목록에 포함되며,
                프론트에서 parentCommentId 기준으로 트리 구성한다.
            `,
            responseType: PaginationResponseDto,
            itemType: CommunityPostCommentResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '댓글 조회 성공',
            successMessageExample: COMMUNITY_RESPONSE_MESSAGES.commentsRetrieved,
            errorResponses: [POST_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'postId', description: '게시글 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiCommunityProtectedController() {
    return ApiController('커뮤니티 (v2, 인증)');
}

const POST_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '본인 게시글이 아님',
    errorExample: '본인 게시글만 수정할 수 있습니다.',
} as const;

export function ApiCreateCommunityPostEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '커뮤니티 게시글 작성 (v2)',
            description: `
                입양자/브리더 모두 작성 가능. JWT role 로 authorModel(Adopter/Breeder) 분기.
                body 필수(≤2000), trim 후 비어있을 수 없음. title/photos/petType/category 선택 (photos ≤10).
                생성된 게시글 상세 + 빈 commentPreview 반환.
            `,
            responseType: CommunityPostDetailResponseDto,
            successDescription: '게시글 등록 성공',
            successMessageExample: COMMUNITY_RESPONSE_MESSAGES.created,
        }),
    );
}

export function ApiUpdateCommunityPostEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '커뮤니티 게시글 수정 (v2)',
            description: '작성자 본인만 가능. body 를 비우는 수정은 거부. 갱신 후 게시글 상세 반환.',
            responseType: CommunityPostDetailResponseDto,
            successDescription: '게시글 수정 성공',
            successMessageExample: COMMUNITY_RESPONSE_MESSAGES.updated,
            errorResponses: [POST_NOT_FOUND_RESPONSE, POST_FORBIDDEN_RESPONSE],
        }),
        ApiParam({ name: 'postId', description: '게시글 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiDeleteCommunityPostEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '커뮤니티 게시글 삭제 (v2, 소프트)',
            description: '작성자 본인만 가능. isActive=false 로 소프트 삭제. 목록/상세에 더 이상 노출되지 않는다.',
            responseType: CommunityPostDeleteResponseDto,
            successDescription: '게시글 삭제 성공',
            successMessageExample: COMMUNITY_RESPONSE_MESSAGES.deleted,
            errorResponses: [POST_NOT_FOUND_RESPONSE, POST_FORBIDDEN_RESPONSE],
        }),
        ApiParam({ name: 'postId', description: '게시글 ID', example: '507f1f77bcf86cd799439011' }),
    );
}
