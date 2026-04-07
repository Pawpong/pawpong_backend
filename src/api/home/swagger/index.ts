import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { AvailablePetResponseDto } from '../dto/response/available-pet-response.dto';
import { BannerResponseDto } from '../dto/response/banner-response.dto';
import { FaqResponseDto } from '../dto/response/faq-response.dto';

const HOME_FAQ_USER_TYPES = ['adopter', 'breeder'] as const;

export function ApiHomeController() {
    return ApiPublicController('홈페이지');
}

export function ApiGetHomeBannersEndpoint() {
    return ApiEndpoint({
        summary: '메인 배너 목록 조회',
        description: `
            홈페이지에 노출할 활성 배너 목록을 조회합니다.

            ## 주요 기능
            - 정렬 순서 기준으로 배너를 반환합니다.
            - 타겟 오디언스 규칙이 반영된 공개 배너만 노출합니다.
        `,
        responseType: [BannerResponseDto],
        isPublic: true,
        successDescription: '배너 목록 조회 성공',
        successMessageExample: '배너 목록이 조회되었습니다.',
    });
}

export function ApiGetHomeFaqsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'FAQ 목록 조회',
            description: `
                사용자 타입에 맞는 FAQ 목록을 조회합니다.

                ## 주요 기능
                - userType을 생략하면 adopter 기준으로 조회합니다.
                - breeder 전용 FAQ와 공통 FAQ를 함께 반환합니다.
            `,
            responseType: [FaqResponseDto],
            isPublic: true,
            successDescription: 'FAQ 목록 조회 성공',
            successMessageExample: 'FAQ 목록이 조회되었습니다.',
        }),
        ApiQuery({
            name: 'userType',
            required: false,
            description: '사용자 타입',
            enum: HOME_FAQ_USER_TYPES,
            example: 'adopter',
        }),
    );
}

export function ApiGetHomeAvailablePetsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '분양 중인 아이들 조회',
            description: `
                홈페이지에 표시할 분양 가능한 반려동물 목록을 조회합니다.

                ## 주요 기능
                - 비로그인 사용자는 가격 정보 없이 공개용 목록을 조회합니다.
                - 로그인 사용자는 노출 규칙에 맞는 추가 정보를 함께 조회합니다.
                - limit는 기본 10, 최대 50까지 지원합니다.
            `,
            responseType: [AvailablePetResponseDto],
            isPublic: true,
            successDescription: '분양 가능한 반려동물 목록 조회 성공',
            successMessageExample: '분양중인 아이들이 조회되었습니다.',
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            description: '조회 개수',
            type: Number,
            example: 10,
        }),
    );
}
