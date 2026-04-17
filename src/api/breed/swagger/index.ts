import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { GetBreedsResponseDto } from '../dto/response/get-breeds-response.dto';

export function ApiBreedController() {
    return ApiPublicController('품종');
}

export function ApiGetBreedsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '동물 타입별 품종 목록 조회',
            description: `
                'dog'(강아지) 또는 'cat'(고양이) 타입에 해당하는 모든 품종 목록을 조회합니다.

                ## 주요 기능
                - 공개(public)된 품종만 반환합니다.
                - 카테고리별로 묶어 반환하며, 가나다 순으로 정렬합니다.

                ## 실패 사유
                - petType이 'dog' 또는 'cat'이 아닌 경우 400 Bad Request를 반환합니다.

                ## 인증 불필요
                - 이 API는 인증 없이 호출할 수 있습니다.
            `,
            responseType: GetBreedsResponseDto,
            isPublic: true,
            successDescription: '품종 목록 조회 성공',
            successMessageExample: '품종 목록을 조회했습니다.',
        }),
        ApiParam({
            name: 'petType',
            description: '조회할 동물 타입',
            enum: ['dog', 'cat'],
            example: 'dog',
        }),
    );
}
