import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiConflictResponse } from '@nestjs/swagger';
export const ApiSupportList = () =>
    applyDecorators(
        ApiOperation({
            summary: '환경별 고객지원 접수 목록',
            description:
                'data에 items, total, page, pageSize 반환함. Discord 전달 상태와 고객지원 처리 상태를 별도로 제공함.',
        }),
        ApiOkResponse({ description: '접수 목록 조회됨' }),
    );
export const ApiSupportUpdate = () =>
    applyDecorators(
        ApiOperation({
            summary: '고객지원 담당자·처리 상태 변경',
            description: 'assignment=me는 현재 인증된 관리자를 지정함. revision 불일치 시 409. 해결 시 note 필수.',
        }),
        ApiOkResponse({ description: '변경된 접수 반환됨' }),
        ApiConflictResponse({ description: '동시 수정 또는 접수 없음' }),
    );
