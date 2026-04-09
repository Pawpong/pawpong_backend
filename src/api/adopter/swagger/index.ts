import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from '../constants/adopter-response-messages';
import { ADOPTER_FORBIDDEN_RESPONSE } from '../constants/adopter-swagger.constants';
import { AccountDeleteRequestDto } from '../dto/request/account-delete-request.dto';
import { ApplicationCreateRequestDto } from '../dto/request/application-create-request.dto';
import { FavoriteAddRequestDto } from '../dto/request/favorite-add-request.dto';
import { ProfileUpdateRequestDto } from '../dto/request/profile-update-request.dto';
import { ReportCreateRequestDto } from '../dto/request/report-create-request.dto';
import { ReviewCreateRequestDto } from '../dto/request/review-create-request.dto';
import { ReviewReportRequestDto } from '../dto/request/review-report-request.dto';
import { AccountDeleteResponseDto } from '../dto/response/account-delete-response.dto';
import { AdopterProfileResponseDto } from '../dto/response/adopter-profile-response.dto';
import { AdopterProfileUpdateResponseDto } from '../dto/response/profile-update-response.dto';
import { ApplicationCreateResponseDto } from '../dto/response/application-create-response.dto';
import { ApplicationDetailResponseDto } from '../dto/response/application-detail-response.dto';
import { ApplicationListItemResponseDto } from '../dto/response/application-list-item-response.dto';
import { ApplicationListResponseDto } from '../dto/response/application-list-response.dto';
import { FavoriteAddResponseDto } from '../dto/response/favorite-add-response.dto';
import { FavoriteBreederDataDto, FavoriteListResponseDto } from '../dto/response/favorite-list-response.dto';
import { FavoriteRemoveResponseDto } from '../dto/response/favorite-remove-response.dto';
import { MyReviewDetailDto } from '../dto/response/my-review-detail.dto';
import { MyReviewItemDto } from '../dto/response/my-review-item.dto';
import { ReportCreateResponseDto } from '../dto/response/report-create-response.dto';
import { ReviewCreateResponseDto } from '../dto/response/review-create-response.dto';
import { ReviewReportResponseDto } from '../dto/response/review-report-response.dto';

export function ApiAdopterController() {
    return ApiController('입양자');
}

export function ApiCreateAdopterApplicationEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양 상담 신청 제출',
            description: `브리더에게 입양 상담 신청을 제출합니다.

**신청 절차:**
- 브리더 ID 필수 입력
- 특정 개체 상담인 경우 petId 입력
- 개인정보 수집 동의 필수
- 기본 상담 문항과 추가 응답을 함께 제출

**비즈니스 규칙:**
- 같은 브리더에게 대기 중인 신청이 있으면 중복 신청할 수 없습니다.
- 신청 후 상태는 consultation_pending으로 저장됩니다.`,
            responseType: ApplicationCreateResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successStatus: 201,
            successDescription: '입양 신청 생성 성공',
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.applicationCreated,
        }),
        ApiBody({ type: ApplicationCreateRequestDto }),
    );
}

export function ApiGetAdopterApplicationsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '내가 보낸 입양 신청 목록 조회',
            description: '입양자가 제출한 입양 신청 목록을 최신순으로 페이지네이션 조회합니다.',
            responseType: ApplicationListResponseDto,
            itemType: ApplicationListItemResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.applicationListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
        ApiQuery({
            name: 'animalType',
            required: false,
            enum: ['cat', 'dog'],
            description: '동물 타입 필터',
        }),
    );
}

export function ApiGetAdopterApplicationDetailEndpoint() {
    return ApiEndpoint({
        summary: '내가 보낸 입양 신청 상세 조회',
        description: '입양자가 제출한 특정 입양 신청의 상세 정보를 조회합니다.',
        responseType: ApplicationDetailResponseDto,
        errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
        successMessageExample: ADOPTER_RESPONSE_MESSAGES.applicationDetailRetrieved,
    });
}

export function ApiCreateAdopterReviewEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 후기 작성',
            description: `상담이 완료된 입양 신청에 대해 후기를 작성합니다.

**작성 가능 조건:**
- 본인의 입양 신청이어야 합니다.
- 신청 상태가 consultation_completed여야 합니다.
- 동일 신청/후기 유형으로 중복 작성할 수 없습니다.`,
            responseType: ReviewCreateResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successStatus: 201,
            successDescription: '후기 작성 성공',
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.reviewCreated,
        }),
        ApiBody({ type: ReviewCreateRequestDto }),
    );
}

export function ApiReportAdopterReviewEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '후기 신고',
            description: '부적절한 내용이 포함된 후기를 신고합니다. 관리자가 검토 후 조치합니다.',
            responseType: ReviewReportResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.reviewReported,
        }),
        ApiBody({ type: ReviewReportRequestDto }),
    );
}

export function ApiGetAdopterReviewsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '내가 작성한 후기 목록 조회',
            description: '입양자가 작성한 후기 목록을 페이지네이션으로 조회합니다.',
            responseType: PaginationResponseDto,
            itemType: MyReviewItemDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.reviewListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
    );
}

export function ApiGetAdopterReviewDetailEndpoint() {
    return ApiEndpoint({
        summary: '후기 세부 조회',
        description: '후기 ID로 특정 후기의 세부 정보를 조회합니다.',
        responseType: MyReviewDetailDto,
        errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
        successMessageExample: ADOPTER_RESPONSE_MESSAGES.reviewDetailRetrieved,
    });
}

export function ApiAddAdopterFavoriteEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '즐겨찾기 브리더 추가',
            description: '관심 있는 브리더를 즐겨찾기에 추가합니다.',
            responseType: FavoriteAddResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.favoriteAdded,
        }),
        ApiBody({ type: FavoriteAddRequestDto }),
    );
}

export function ApiRemoveAdopterFavoriteEndpoint() {
    return ApiEndpoint({
        summary: '즐겨찾기 브리더 삭제',
        description: '즐겨찾기에서 브리더를 삭제합니다.',
        responseType: FavoriteRemoveResponseDto,
        errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
        successMessageExample: ADOPTER_RESPONSE_MESSAGES.favoriteRemoved,
    });
}

export function ApiGetAdopterFavoritesEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '즐겨찾기 브리더 목록 조회',
            description: '입양자가 즐겨찾기에 추가한 브리더 목록을 페이지네이션과 함께 조회합니다.',
            responseType: FavoriteListResponseDto,
            itemType: FavoriteBreederDataDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.favoriteListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
    );
}

export function ApiCreateAdopterReportEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 신고',
            description: '부적절한 사용자나 브리더를 신고합니다.',
            responseType: ReportCreateResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.reportSubmitted,
        }),
        ApiBody({ type: ReportCreateRequestDto }),
    );
}

export function ApiGetAdopterProfileEndpoint() {
    return ApiEndpoint({
        summary: '입양자 프로필 조회',
        description: '로그인한 입양자의 프로필 정보를 조회합니다.',
        responseType: AdopterProfileResponseDto,
        errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
        successMessageExample: ADOPTER_RESPONSE_MESSAGES.profileRetrieved,
    });
}

export function ApiUpdateAdopterProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양자 프로필 수정',
            description: '입양자의 프로필 정보를 수정합니다.',
            responseType: AdopterProfileUpdateResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.profileUpdated,
        }),
        ApiBody({ type: ProfileUpdateRequestDto }),
    );
}

export function ApiDeleteAdopterAccountEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '회원 탈퇴',
            description: `입양자 계정을 탈퇴합니다.

**탈퇴 처리:**
- 계정 정보는 소프트 삭제됩니다.
- 탈퇴 사유와 시각을 기록합니다.
- 관련 활동 데이터는 통계 목적상 보존됩니다.`,
            responseType: AccountDeleteResponseDto,
            errorResponses: [ADOPTER_FORBIDDEN_RESPONSE],
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.accountDeleted,
        }),
        ApiBody({ type: AccountDeleteRequestDto }),
    );
}
