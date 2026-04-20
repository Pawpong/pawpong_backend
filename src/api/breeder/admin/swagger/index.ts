import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { BreederRemindResponseDto } from '../dto/response/breeder-remind-response.dto';
import { BreederSuspendResponseDto } from '../dto/response/breeder-suspend-response.dto';
import { SetTestAccountResponseDto } from '../dto/response/set-test-account-response.dto';
import { BreederRemindRequestDto } from '../dto/request/breeder-remind-request.dto';
import { BreederSuspendRequestDto } from '../dto/request/breeder-suspend-request.dto';
import { SetTestAccountRequestDto } from '../dto/request/set-test-account-request.dto';
import {
    BREEDER_RESPONSE_MESSAGES,
    buildBreederDocumentReminderMessage,
    buildBreederTestAccountMessage,
} from '../../constants/breeder-response-messages';
import {
    BREEDER_ADMIN_FORBIDDEN_RESPONSE,
    BREEDER_ADMIN_NOT_FOUND_RESPONSE,
} from '../constants/breeder-admin-swagger.constants';

export function ApiBreederAdminController() {
    return ApiController('브리더 관리 (Admin)');
}

export function ApiSuspendBreederAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 제재 처리 (영구정지)',
            description: '브리더 계정을 영구정지 처리하고 알림을 발송합니다.',
            responseType: BreederSuspendResponseDto,
            errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_ADMIN_NOT_FOUND_RESPONSE],
            successDescription: '브리더 영구정지 성공',
            successMessageExample: BREEDER_RESPONSE_MESSAGES.accountSuspended,
        }),
        ApiParam({
            name: 'breederId',
            description: '제재할 브리더 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: BreederSuspendRequestDto }),
    );
}

export function ApiUnsuspendBreederAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 정지 해제',
            description: '정지된 브리더 계정을 활성화하고 알림을 발송합니다.',
            responseType: BreederSuspendResponseDto,
            errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_ADMIN_NOT_FOUND_RESPONSE],
            successDescription: '브리더 정지 해제 성공',
            successMessageExample: BREEDER_RESPONSE_MESSAGES.accountUnsuspended,
        }),
        ApiParam({
            name: 'breederId',
            description: '정지 해제할 브리더 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiSendBreederRemindNotificationsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '리마인드 알림 발송',
            description: '서류 미제출 브리더들에게 리마인드 알림을 발송합니다. (서비스 알림 + 이메일 알림)',
            responseType: BreederRemindResponseDto,
            successDescription: '리마인드 알림 발송 성공',
            successMessageExample: buildBreederDocumentReminderMessage(3),
            errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiBody({ type: BreederRemindRequestDto }),
    );
}

export function ApiSetBreederTestAccountAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '테스트 계정 설정',
            description:
                '브리더를 테스트 계정으로 설정하거나 해제합니다. 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.',
            responseType: SetTestAccountResponseDto,
            successDescription: '테스트 계정 설정 성공',
            successMessageExample: buildBreederTestAccountMessage(true),
            errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'breederId',
            description: '테스트 계정 여부를 변경할 브리더 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: SetTestAccountRequestDto }),
    );
}
