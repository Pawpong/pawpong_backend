import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';
import {
    HOME_ADMIN_BAD_REQUEST_RESPONSE,
    HOME_ADMIN_BANNER_NOT_FOUND_RESPONSE,
    HOME_ADMIN_FAQ_NOT_FOUND_RESPONSE,
    HOME_ADMIN_FORBIDDEN_RESPONSE,
} from '../../constants/home-swagger.constants';
import { BannerCreateRequestDto } from '../dto/request/banner-create-request.dto';
import { BannerUpdateRequestDto } from '../dto/request/banner-update-request.dto';
import { FaqCreateRequestDto } from '../dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from '../dto/request/faq-update-request.dto';
import { BannerResponseDto } from '../../dto/response/banner-response.dto';
import { FaqResponseDto } from '../../dto/response/faq-response.dto';

export function ApiHomeAdminController() {
    return ApiController('홈페이지 관리 (관리자)');
}

export function ApiGetAllBannersAdminEndpoint() {
    return ApiEndpoint({
        summary: '배너 전체 목록 조회 (관리자)',
        description: `
            활성/비활성 상태를 포함한 모든 홈 배너를 조회합니다.

            ## 주요 기능
            - 관리자 화면에 필요한 전체 배너 목록을 반환합니다.
            - 응답의 imageUrl은 서명 URL 규칙을 반영해 가공됩니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: [BannerResponseDto],
        successDescription: '배너 목록 조회 성공',
        successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved,
        errorResponses: [HOME_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiCreateBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '배너 생성',
            description: `
                새로운 홈 배너를 생성합니다.

                ## 주요 기능
                - 제목, 이미지 URL, 링크 URL, 활성 여부, 노출 순서를 저장합니다.
                - 생성 직후 관리자 응답 형식으로 가공된 배너를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: BannerResponseDto,
            successDescription: '배너 생성 성공',
            successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated,
            errorResponses: [HOME_ADMIN_BAD_REQUEST_RESPONSE, HOME_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiBody({ type: BannerCreateRequestDto }),
    );
}

export function ApiUpdateBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '배너 수정',
            description: `
                기존 홈 배너를 수정합니다.

                ## 주요 기능
                - 배너의 제목, 이미지 URL, 링크 URL, 활성 여부, 순서를 수정할 수 있습니다.
                - 존재하지 않는 배너 ID로 요청하면 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: BannerResponseDto,
            successDescription: '배너 수정 성공',
            successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated,
            errorResponses: [HOME_ADMIN_FORBIDDEN_RESPONSE, HOME_ADMIN_BANNER_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'bannerId',
            description: '수정할 배너 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: BannerUpdateRequestDto }),
    );
}

export function ApiDeleteBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '배너 삭제',
            description: `
                홈 배너를 삭제합니다.

                ## 주의사항
                - 삭제된 배너는 복구할 수 없습니다.
                - 존재하지 않는 배너 ID로 요청하면 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '배너 삭제 성공',
            successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted,
            nullableData: true,
            errorResponses: [HOME_ADMIN_FORBIDDEN_RESPONSE, HOME_ADMIN_BANNER_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'bannerId',
            description: '삭제할 배너 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiGetAllFaqsAdminEndpoint() {
    return ApiEndpoint({
        summary: 'FAQ 전체 목록 조회 (관리자)',
        description: `
            활성/비활성 상태를 포함한 모든 FAQ를 조회합니다.

            ## 주요 기능
            - 관리자 화면에서 편집 가능한 전체 FAQ 목록을 반환합니다.
            - 카테고리와 노출 순서를 포함한 응답을 제공합니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: [FaqResponseDto],
        successDescription: 'FAQ 목록 조회 성공',
        successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.faqsRetrieved,
        errorResponses: [HOME_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiCreateFaqAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'FAQ 생성',
            description: `
                새로운 FAQ를 생성합니다.

                ## 주요 기능
                - question, answer, category, isActive, order 값을 저장합니다.
                - 생성 직후 관리자 응답 형식의 FAQ를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: FaqResponseDto,
            successDescription: 'FAQ 생성 성공',
            successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated,
            errorResponses: [HOME_ADMIN_BAD_REQUEST_RESPONSE, HOME_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiBody({ type: FaqCreateRequestDto }),
    );
}

export function ApiUpdateFaqAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'FAQ 수정',
            description: `
                기존 FAQ를 수정합니다.

                ## 주요 기능
                - 질문, 답변, 카테고리, 활성 여부, 순서를 수정할 수 있습니다.
                - 존재하지 않는 FAQ ID로 요청하면 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: FaqResponseDto,
            successDescription: 'FAQ 수정 성공',
            successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated,
            errorResponses: [HOME_ADMIN_FORBIDDEN_RESPONSE, HOME_ADMIN_FAQ_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'faqId',
            description: '수정할 FAQ ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: FaqUpdateRequestDto }),
    );
}

export function ApiDeleteFaqAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'FAQ 삭제',
            description: `
                FAQ를 삭제합니다.

                ## 주의사항
                - 삭제된 FAQ는 복구할 수 없습니다.
                - 존재하지 않는 FAQ ID로 요청하면 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: 'FAQ 삭제 성공',
            successMessageExample: HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted,
            nullableData: true,
            errorResponses: [HOME_ADMIN_FORBIDDEN_RESPONSE, HOME_ADMIN_FAQ_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'faqId',
            description: '삭제할 FAQ ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
