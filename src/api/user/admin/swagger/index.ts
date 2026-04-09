import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { UserStatus } from '../../../../common/enum/user.enum';
import {
    USER_ADMIN_FORBIDDEN_RESPONSE,
    USER_ADMIN_MANAGED_ROLE_QUERY_OPTIONS,
    USER_ADMIN_SUPER_ADMIN_RESPONSE,
} from '../constants/user-admin-swagger.constants';
import { USER_ADMIN_RESPONSE_MESSAGES } from '../constants/user-admin-response-messages';
import { AdminProfileResponseDto } from '../dto/response/admin-profile-response.dto';
import { DeletedUserResponseDto } from '../dto/response/deleted-user-response.dto';
import { DeletedUserStatsResponseDto } from '../dto/response/deleted-user-stats-response.dto';
import { PhoneWhitelistListResponseDto, PhoneWhitelistResponseDto } from '../dto/response/phone-whitelist-response.dto';
import { UserManagementResponseDto } from '../dto/response/user-management-response.dto';
import { UserStatusUpdateResponseDto } from '../dto/response/user-status-update-response.dto';

export function ApiUserAdminController() {
    return ApiController('사용자 관리 관리자');
}

export function ApiGetUserAdminProfileEndpoint() {
    return ApiEndpoint({
        summary: '관리자 프로필 조회',
        description: `
            현재 로그인한 관리자의 프로필을 조회합니다.

            ## 주요 기능
            - 관리자 계정 기본 정보와 권한을 반환합니다.
            - 마지막 로그인 시각까지 함께 제공합니다.
        `,
        responseType: AdminProfileResponseDto,
        successDescription: '관리자 프로필 조회 성공',
        successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.profileRetrieved,
        errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiGetUsersAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '통합 사용자 목록 조회',
            description: `
                입양자와 브리더를 통합해 조회합니다.

                ## 주요 기능
                - 역할, 계정 상태, 검색어 필터를 지원합니다.
                - 페이지네이션 기준으로 목록과 메타 정보를 함께 반환합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: UserManagementResponseDto,
            successDescription: '사용자 목록 조회 성공',
            successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.usersRetrieved,
            errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'userRole', required: false, enum: ['adopter', 'breeder'], description: '사용자 역할 필터', example: 'adopter' }),
        ApiQuery({ name: 'accountStatus', required: false, enum: UserStatus, description: '계정 상태 필터', example: UserStatus.ACTIVE }),
        ApiQuery({ name: 'searchKeyword', required: false, type: String, description: '이름 또는 이메일 검색어', example: '김사용자' }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수', example: 10 }),
    );
}

export function ApiUpdateUserStatusAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '사용자 상태 변경',
            description: `
                입양자 또는 브리더 계정의 상태를 변경합니다.

                ## 주요 기능
                - 대상 사용자의 현재 상태를 확인한 뒤 변경을 수행합니다.
                - 변경 이력은 관리자 활동 로그에 남습니다.
            `,
            dataSchema: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: 'breeder status updated to suspended' },
                },
                required: ['message'],
            },
            successDescription: '사용자 상태 변경 성공',
            successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.userStatusUpdated,
            errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery(USER_ADMIN_MANAGED_ROLE_QUERY_OPTIONS),
    );
}

export function ApiGetDeletedUsersAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '탈퇴 사용자 목록 조회',
            description: `
                탈퇴한 입양자와 브리더를 조회합니다.

                ## 주요 기능
                - 역할과 탈퇴 사유 필터를 지원합니다.
                - 관리자 활동 로그를 함께 기록합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: DeletedUserResponseDto,
            successDescription: '탈퇴 사용자 목록 조회 성공',
            successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.deletedUsersRetrieved,
            errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수', example: 20 }),
        ApiQuery({ name: 'role', required: false, enum: ['all', 'adopter', 'breeder'], description: '사용자 역할 필터', example: 'all' }),
        ApiQuery({ name: 'deleteReason', required: false, type: String, description: '탈퇴 사유 필터', example: 'already_adopted' }),
    );
}

export function ApiGetDeletedUserStatsAdminEndpoint() {
    return ApiEndpoint({
        summary: '탈퇴 사용자 통계 조회',
        description: `
            탈퇴 사용자 전체 통계를 조회합니다.

            ## 주요 기능
            - 전체 탈퇴 수와 역할별 탈퇴 수를 반환합니다.
            - 탈퇴 사유별 집계 결과도 함께 제공합니다.
        `,
        responseType: DeletedUserStatsResponseDto,
        successDescription: '탈퇴 사용자 통계 조회 성공',
        successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.deletedUserStatsRetrieved,
        errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiRestoreDeletedUserAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '탈퇴 사용자 복구',
            description: `
                deleted 상태의 사용자를 active 상태로 복구합니다.

                ## 주요 기능
                - 입양자와 브리더 모두 동일한 계약으로 복구할 수 있습니다.
                - 복구 시 변경 전 상태와 변경 시각을 응답으로 반환합니다.
            `,
            responseType: UserStatusUpdateResponseDto,
            successDescription: '탈퇴 사용자 복구 성공',
            successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.deletedUserRestored,
            errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery(USER_ADMIN_MANAGED_ROLE_QUERY_OPTIONS),
    );
}

export function ApiHardDeleteUserAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '사용자 영구 삭제',
            description: `
                deleted 상태의 사용자를 데이터베이스에서 영구 삭제합니다.

                ## 주요 기능
                - super_admin 권한이 필요합니다.
                - 삭제 대상의 이름과 이메일을 응답에 포함합니다.
            `,
            dataSchema: {
                type: 'object',
                properties: {
                    userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    role: { type: 'string', enum: ['adopter', 'breeder'], example: 'breeder' },
                    userName: { type: 'string', example: '홍길동 브리더' },
                    userEmail: { type: 'string', example: 'breeder@pawpong.kr' },
                    deletedAt: { type: 'string', format: 'date-time', example: '2025-01-26T10:30:00.000Z' },
                    message: { type: 'string', example: '브리더 데이터가 영구적으로 삭제되었습니다.' },
                },
                required: ['userId', 'role', 'userName', 'userEmail', 'deletedAt', 'message'],
            },
            successDescription: '사용자 영구 삭제 성공',
            successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.userHardDeleted,
            errorResponses: [USER_ADMIN_SUPER_ADMIN_RESPONSE],
        }),
        ApiQuery(USER_ADMIN_MANAGED_ROLE_QUERY_OPTIONS),
    );
}

export function ApiGetPhoneWhitelistAdminEndpoint() {
    return ApiEndpoint({
        summary: '전화번호 화이트리스트 목록 조회',
        description: `
            중복 가입이 허용되는 전화번호 화이트리스트를 조회합니다.

            ## 주요 기능
            - 현재 등록된 화이트리스트 전체 목록과 총 개수를 반환합니다.
            - 각 항목의 생성자, 활성 상태, 생성일시를 확인할 수 있습니다.
        `,
        responseType: PhoneWhitelistListResponseDto,
        successDescription: '화이트리스트 목록 조회 성공',
        successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistRetrieved,
        errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiAddPhoneWhitelistAdminEndpoint() {
    return ApiEndpoint({
        summary: '전화번호 화이트리스트 추가',
        description: `
            중복 가입을 허용할 전화번호를 화이트리스트에 추가합니다.

            ## 주요 기능
            - 관리자 ID를 생성자 정보로 기록합니다.
            - 이미 등록된 번호면 예외를 반환합니다.
        `,
        responseType: PhoneWhitelistResponseDto,
        successStatus: 201,
        successDescription: '화이트리스트 추가 성공',
        successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistCreated,
        errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiUpdatePhoneWhitelistAdminEndpoint() {
    return ApiEndpoint({
        summary: '전화번호 화이트리스트 수정',
        description: `
            화이트리스트 항목의 설명 또는 활성 상태를 수정합니다.

            ## 주요 기능
            - 부분 수정 형태로 동작합니다.
            - 존재하지 않는 항목이면 예외를 반환합니다.
        `,
        responseType: PhoneWhitelistResponseDto,
        successDescription: '화이트리스트 수정 성공',
        successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistUpdated,
        errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiDeletePhoneWhitelistAdminEndpoint() {
    return ApiEndpoint({
        summary: '전화번호 화이트리스트 삭제',
        description: `
            화이트리스트에서 전화번호 항목을 삭제합니다.

            ## 주요 기능
            - 존재하는 화이트리스트 항목만 삭제할 수 있습니다.
            - 삭제 결과 메시지를 data 필드로 반환합니다.
        `,
        dataSchema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: '화이트리스트가 삭제되었습니다.' },
            },
            required: ['message'],
        },
        successDescription: '화이트리스트 삭제 성공',
        successMessageExample: USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistDeleted,
        errorResponses: [USER_ADMIN_FORBIDDEN_RESPONSE],
    });
}
