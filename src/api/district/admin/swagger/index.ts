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
            description: '새로운 지역을 생성합니다. (관리자 전용)',
            responseType: DistrictResponseDto,
        }),
        ApiBody({ type: CreateDistrictRequestDto }),
    );
}

export function ApiGetAllDistrictsAdminEndpoint() {
    return ApiEndpoint({
        summary: '모든 지역 조회',
        description: '모든 지역을 조회합니다. (관리자 전용)',
        responseType: [DistrictResponseDto],
    });
}

export function ApiGetDistrictByIdAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '특정 지역 조회',
            description: 'ID로 특정 지역을 조회합니다. (관리자 전용)',
            responseType: DistrictResponseDto,
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
            description: '기존 지역을 수정합니다. (관리자 전용)',
            responseType: DistrictResponseDto,
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
            description: '기존 지역을 삭제합니다. (관리자 전용)',
            nullableData: true,
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
