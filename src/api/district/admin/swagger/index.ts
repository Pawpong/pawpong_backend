import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { CreateDistrictRequestDto } from '../dto/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from '../dto/request/update-district-request.dto';
import { DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/district-admin-response-messages';
import { DISTRICT_ADMIN_NOT_FOUND_RESPONSE } from '../constants/district-admin-swagger.constants';
import { DistrictResponseDto } from '../../dto/response/district-response.dto';

export function ApiDistrictAdminController() {
    return ApiController('지역 관리 (Admin)');
}

export function ApiCreateDistrictAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '지역 생성',
            description: `
                새로운 지역을 시스템에 추가합니다.

                ## 주요 기능
                - 시/도 단위 지역 데이터를 생성합니다.
                - 생성된 지역은 공개 API에서 즉시 조회 가능합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: DistrictResponseDto,
            successDescription: '지역 생성 성공',
            successMessageExample: DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtCreated,
        }),
        ApiBody({ type: CreateDistrictRequestDto }),
    );
}

export function ApiGetAllDistrictsAdminEndpoint() {
    return ApiEndpoint({
        summary: '모든 지역 조회 (관리자)',
        description: `
            시스템에 등록된 모든 지역 목록을 조회합니다.

            ## 주요 기능
            - 비활성 상태의 지역도 함께 반환됩니다.
            - 공개 API와 달리 모든 상태의 지역을 조회합니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: [DistrictResponseDto],
        successDescription: '지역 목록 조회 성공',
        successMessageExample: DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtsRetrieved,
    });
}

export function ApiGetDistrictByIdAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '특정 지역 조회 (관리자)',
            description: `
                ID를 사용하여 특정 지역의 상세 정보를 조회합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: DistrictResponseDto,
            successDescription: '지역 조회 성공',
            successMessageExample: DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtRetrieved,
            errorResponses: [DISTRICT_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '조회할 지역 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiUpdateDistrictAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '지역 수정',
            description: `
                기존 지역의 정보를 수정합니다.

                ## 수정 가능 필드
                - name: 지역명
                - 기타 지역 관련 필드

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: DistrictResponseDto,
            successDescription: '지역 수정 성공',
            successMessageExample: DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtUpdated,
            errorResponses: [DISTRICT_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '수정할 지역 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: UpdateDistrictRequestDto }),
    );
}

export function ApiDeleteDistrictAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '지역 삭제',
            description: `
                ID를 사용하여 특정 지역을 시스템에서 삭제합니다.

                ## 주의사항
                - 삭제된 지역은 복구할 수 없습니다.
                - 해당 지역과 연결된 브리더 데이터가 있을 경우 문제가 발생할 수 있습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            nullableData: true,
            successDescription: '지역 삭제 성공',
            successMessageExample: DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtDeleted,
            errorResponses: [DISTRICT_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '삭제할 지역 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
