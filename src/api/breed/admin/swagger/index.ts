import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { CreateBreedRequestDto } from '../dto/request/create-breed-request.dto';
import { UpdateBreedRequestDto } from '../dto/request/update-breed-request.dto';
import { BreedResponseDto } from '../../dto/response/breed-response.dto';
import { BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/breed-admin-response-messages';
import { BREED_ADMIN_NOT_FOUND_RESPONSE } from '../constants/breed-admin-swagger.constants';

export function ApiBreedAdminController() {
    return ApiController('품종 관리 (Admin)');
}

export function ApiCreateBreedAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '품종 생성 (관리자)',
            description: `
                새로운 품종을 시스템에 추가합니다.

                ## 요청 본문
                - petType: 동물 종류 ('dog' 또는 'cat')
                - category: 품종 카테고리
                - categoryDescription: 카테고리 설명
                - breeds: 품종 목록

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: BreedResponseDto,
            successDescription: '품종 생성 성공',
            successMessageExample: BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedCreated,
        }),
        ApiBody({
            type: CreateBreedRequestDto,
        }),
    );
}

export function ApiGetAllBreedsAdminEndpoint() {
    return ApiEndpoint({
        summary: '모든 품종 조회 (관리자)',
        description: `
            시스템에 등록된 모든 품종 목록을 조회합니다.

            ## 주요 기능
            - 비공개 상태의 품종도 함께 반환됩니다.
            - 동물 타입(dog/cat)과 카테고리별로 묶어 반환합니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: [BreedResponseDto],
        successDescription: '품종 목록 조회 성공',
        successMessageExample: BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedsRetrieved,
    });
}

export function ApiGetBreedByIdAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '특정 품종 조회 (관리자)',
            description: `
                ID를 사용하여 특정 품종의 상세 정보를 조회합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: BreedResponseDto,
            successDescription: '품종 조회 성공',
            successMessageExample: BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedRetrieved,
            errorResponses: [BREED_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '조회할 품종 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiUpdateBreedAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '품종 정보 수정 (관리자)',
            description: `
                기존 품종의 정보를 수정합니다.

                ## 수정 가능 필드
                - category: 품종 카테고리
                - categoryDescription: 카테고리 설명
                - breeds: 품종 목록

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: BreedResponseDto,
            successDescription: '품종 수정 성공',
            successMessageExample: BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedUpdated,
            errorResponses: [BREED_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '수정할 품종 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({
            type: UpdateBreedRequestDto,
        }),
    );
}

export function ApiDeleteBreedAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '품종 삭제 (관리자)',
            description: `
                ID를 사용하여 특정 품종을 시스템에서 삭제합니다.

                ## 주의사항
                - 이 작업은 되돌릴 수 없습니다.
                - 해당 품종과 연결된 데이터가 있을 경우 문제가 발생할 수 있습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '품종 삭제 성공',
            successMessageExample: BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedDeleted,
            nullableData: true,
            errorResponses: [BREED_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '삭제할 품종 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
