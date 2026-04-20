import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';
import {
    BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
    BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
} from '../../constants/breeder-management-swagger.constants';
import { CounselBannerCreateRequestDto } from '../dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from '../dto/request/counsel-banner-update-request.dto';
import { ProfileBannerCreateRequestDto } from '../dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from '../dto/request/profile-banner-update-request.dto';
import { CounselBannerResponseDto } from '../dto/response/counsel-banner-response.dto';
import { ProfileBannerResponseDto } from '../dto/response/profile-banner-response.dto';

export function ApiBreederManagementAdminController() {
    return ApiController('브리더 관리 배너 (Admin)');
}

export function ApiGetAllProfileBannersAdminEndpoint() {
    return ApiEndpoint({
        summary: '프로필 배너 전체 목록 조회',
        description: `
            활성/비활성 상태를 포함한 모든 프로필 배너를 조회합니다.

            ## 주요 기능
            - 관리자 화면 편집용 전체 목록을 반환합니다.
            - 배너 타입과 정렬 순서를 함께 제공합니다.
        `,
        responseType: [ProfileBannerResponseDto],
        successDescription: '프로필 배너 목록 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerListRetrieved,
        errorResponses: [BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiGetActiveProfileBannersAdminEndpoint() {
    return ApiEndpoint({
        summary: '활성 프로필 배너 목록 조회',
        description: `
            프로필 페이지에 노출할 활성 배너만 조회합니다.

            ## 주요 기능
            - 인증 없이도 접근 가능한 공개 엔드포인트입니다.
            - 현재 노출 가능한 배너만 응답에 포함합니다.
        `,
        responseType: [ProfileBannerResponseDto],
        isPublic: true,
        successDescription: '활성 프로필 배너 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.activeProfileBannerListRetrieved,
    });
}

export function ApiCreateProfileBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '프로필 배너 생성',
            description: `
                새로운 프로필 배너를 생성합니다.

                ## 주요 기능
                - 이미지 파일명, 링크 정보, 제목, 설명, 정렬 순서를 저장합니다.
                - 생성 직후 가공된 배너 응답을 반환합니다.
            `,
            responseType: ProfileBannerResponseDto,
            successStatus: 201,
            successDescription: '프로필 배너 생성 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerCreated,
            errorResponses: [
                BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
                BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
            ],
        }),
        ApiBody({ type: ProfileBannerCreateRequestDto }),
    );
}

export function ApiUpdateProfileBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '프로필 배너 수정',
            description: `
                기존 프로필 배너를 수정합니다.

                ## 주요 기능
                - 이미지, 링크, 제목, 설명, 활성 여부, 순서를 수정할 수 있습니다.
                - 존재하지 않는 배너 ID이면 예외를 반환합니다.
            `,
            responseType: ProfileBannerResponseDto,
            successDescription: '프로필 배너 수정 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerUpdated,
            errorResponses: [
                BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
                BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
            ],
        }),
        ApiParam({
            name: 'bannerId',
            description: '수정할 프로필 배너 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: ProfileBannerUpdateRequestDto }),
    );
}

export function ApiDeleteProfileBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '프로필 배너 삭제',
            description: `
                프로필 배너를 삭제합니다.

                ## 주요 기능
                - 존재하는 배너만 삭제할 수 있습니다.
                - 삭제 후 data는 null로 반환합니다.
            `,
            nullableData: true,
            successDescription: '프로필 배너 삭제 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerDeleted,
            errorResponses: [
                BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
                BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
            ],
        }),
        ApiParam({
            name: 'bannerId',
            description: '삭제할 프로필 배너 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiGetAllCounselBannersAdminEndpoint() {
    return ApiEndpoint({
        summary: '상담 배너 전체 목록 조회',
        description: `
            활성/비활성 상태를 포함한 모든 상담 배너를 조회합니다.

            ## 주요 기능
            - 관리자 편집용 상담 배너 전체 목록을 제공합니다.
            - 링크 정보와 노출 순서를 함께 반환합니다.
        `,
        responseType: [CounselBannerResponseDto],
        successDescription: '상담 배너 목록 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerListRetrieved,
        errorResponses: [BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiGetActiveCounselBannersAdminEndpoint() {
    return ApiEndpoint({
        summary: '활성 상담 배너 목록 조회',
        description: `
            상담 신청 페이지에 노출할 활성 배너만 조회합니다.

            ## 주요 기능
            - 인증 없이 접근 가능한 공개 엔드포인트입니다.
            - 현재 활성 상태인 상담 배너만 반환합니다.
        `,
        responseType: [CounselBannerResponseDto],
        isPublic: true,
        successDescription: '활성 상담 배너 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.activeCounselBannerListRetrieved,
    });
}

export function ApiCreateCounselBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '상담 배너 생성',
            description: `
                새로운 상담 배너를 생성합니다.

                ## 주요 기능
                - 이미지 파일명과 링크 정보를 저장합니다.
                - 생성된 상담 배너를 즉시 응답으로 반환합니다.
            `,
            responseType: CounselBannerResponseDto,
            successStatus: 201,
            successDescription: '상담 배너 생성 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerCreated,
            errorResponses: [
                BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
                BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
            ],
        }),
        ApiBody({ type: CounselBannerCreateRequestDto }),
    );
}

export function ApiUpdateCounselBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '상담 배너 수정',
            description: `
                기존 상담 배너를 수정합니다.

                ## 주요 기능
                - 이미지, 링크, 제목, 설명, 활성 여부, 순서를 수정할 수 있습니다.
                - 존재하지 않는 배너 ID이면 예외를 반환합니다.
            `,
            responseType: CounselBannerResponseDto,
            successDescription: '상담 배너 수정 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerUpdated,
            errorResponses: [
                BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
                BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
            ],
        }),
        ApiParam({
            name: 'bannerId',
            description: '수정할 상담 배너 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: CounselBannerUpdateRequestDto }),
    );
}

export function ApiDeleteCounselBannerAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '상담 배너 삭제',
            description: `
                상담 배너를 삭제합니다.

                ## 주요 기능
                - 존재하는 배너만 삭제할 수 있습니다.
                - 삭제 후 data는 null로 반환합니다.
            `,
            nullableData: true,
            successDescription: '상담 배너 삭제 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerDeleted,
            errorResponses: [
                BREEDER_MANAGEMENT_ADMIN_BAD_REQUEST_RESPONSE,
                BREEDER_MANAGEMENT_ADMIN_FORBIDDEN_RESPONSE,
            ],
        }),
        ApiParam({
            name: 'bannerId',
            description: '삭제할 상담 배너 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
