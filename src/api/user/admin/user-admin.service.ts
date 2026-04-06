import { Injectable } from '@nestjs/common';

import { UserSearchRequestDto } from './dto/request/user-search-request.dto';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { DeletedUserSearchRequestDto } from './dto/request/deleted-user-search-request.dto';
import { AddPhoneWhitelistRequestDto, UpdatePhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistResponseDto, PhoneWhitelistListResponseDto } from './dto/response/phone-whitelist-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { DeletedUserResponseDto } from './dto/response/deleted-user-response.dto';
import { DeletedUserStatsResponseDto } from './dto/response/deleted-user-stats-response.dto';
import { UserManagementResponseDto } from './dto/response/user-management-response.dto';
import { UserStatusUpdateResponseDto } from './dto/response/user-status-update-response.dto';
import { AddPhoneWhitelistUseCase } from './application/use-cases/add-phone-whitelist.use-case';
import { DeletePhoneWhitelistUseCase } from './application/use-cases/delete-phone-whitelist.use-case';
import { GetAdminProfileUseCase } from './application/use-cases/get-admin-profile.use-case';
import { GetDeletedUsersUseCase } from './application/use-cases/get-deleted-users.use-case';
import { GetDeletedUserStatsUseCase } from './application/use-cases/get-deleted-user-stats.use-case';
import { GetPhoneWhitelistUseCase } from './application/use-cases/get-phone-whitelist.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { UpdatePhoneWhitelistUseCase } from './application/use-cases/update-phone-whitelist.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';

/**
 * 사용자 관리 Admin 서비스
 *
 * 사용자 관리 관련 관리자 기능을 제공합니다:
 * - 관리자 프로필 관리
 * - 통합 사용자 관리 (입양자 + 브리더)
 * - 사용자 상태 변경
 * - 전화번호 화이트리스트 관리
 */
@Injectable()
export class UserAdminService {
    constructor(
        private readonly getAdminProfileUseCase: GetAdminProfileUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
        private readonly getDeletedUsersUseCase: GetDeletedUsersUseCase,
        private readonly getDeletedUserStatsUseCase: GetDeletedUserStatsUseCase,
        private readonly restoreDeletedUserUseCase: RestoreDeletedUserUseCase,
        private readonly hardDeleteUserUseCase: HardDeleteUserUseCase,
        private readonly getPhoneWhitelistUseCase: GetPhoneWhitelistUseCase,
        private readonly addPhoneWhitelistUseCase: AddPhoneWhitelistUseCase,
        private readonly updatePhoneWhitelistUseCase: UpdatePhoneWhitelistUseCase,
        private readonly deletePhoneWhitelistUseCase: DeletePhoneWhitelistUseCase,
    ) {}

    /**
     * 관리자 프로필 조회
     *
     * @param adminId 관리자 고유 ID
     * @returns 관리자 프로필 정보
     */
    async getAdminProfile(adminId: string): Promise<any> {
        return this.getAdminProfileUseCase.execute(adminId);
    }

    /**
     * 통합 사용자 목록 조회
     *
     * 입양자와 브리더를 통합하여 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param filter 검색 필터 (role, status, keyword, pagination)
     * @returns 사용자 목록
     */
    async getUsers(
        adminId: string,
        filter: UserSearchRequestDto,
    ): Promise<PaginationResponseDto<UserManagementResponseDto>> {
        return this.getUsersUseCase.execute(adminId, filter);
    }

    /**
     * 사용자 상태 변경
     *
     * 입양자 또는 브리더의 계정 상태를 변경합니다 (활성화/정지).
     *
     * @param adminId 관리자 고유 ID
     * @param userId 대상 사용자 ID
     * @param role 사용자 역할 (adopter | breeder)
     * @param userData 상태 변경 데이터
     * @returns 변경 결과
     */
    async updateUserStatus(
        adminId: string,
        userId: string,
        role: 'adopter' | 'breeder',
        userData: UserManagementRequestDto,
    ): Promise<any> {
        return this.updateUserStatusUseCase.execute(adminId, userId, role, userData);
    }

    /**
     * 탈퇴 사용자 목록 조회
     *
     * 입양자와 브리더 중 탈퇴한 사용자를 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param filter 검색 필터 (role, deleteReason, pagination)
     * @returns 탈퇴 사용자 목록
     */
    async getDeletedUsers(
        adminId: string,
        filter: DeletedUserSearchRequestDto,
    ): Promise<PaginationResponseDto<DeletedUserResponseDto>> {
        return this.getDeletedUsersUseCase.execute(adminId, filter);
    }

    /**
     * 탈퇴 사용자 통계 조회
     *
     * 탈퇴 사용자에 대한 전체 통계를 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @returns 탈퇴 사용자 통계
     */
    async getDeletedUserStats(adminId: string): Promise<DeletedUserStatsResponseDto> {
        return this.getDeletedUserStatsUseCase.execute(adminId);
    }

    /**
     * 탈퇴 사용자 복구
     *
     * 탈퇴한 사용자를 active 상태로 복구합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param userId 복구할 사용자 ID
     * @param role 사용자 역할 (adopter 또는 breeder)
     * @returns 복구 결과
     */
    async restoreDeletedUser(
        adminId: string,
        userId: string,
        role: 'adopter' | 'breeder',
    ): Promise<UserStatusUpdateResponseDto> {
        return this.restoreDeletedUserUseCase.execute(adminId, userId, role);
    }

    /**
     * 사용자 영구 삭제 (하드 딜리트)
     *
     * DB에서 사용자 데이터를 완전히 삭제합니다.
     * deleted 상태의 사용자만 삭제 가능하며, super_admin 권한이 필요합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param userId 삭제할 사용자 ID
     * @param role 사용자 역할 (adopter 또는 breeder)
     * @returns 삭제 결과
     */
    async hardDeleteUser(adminId: string, userId: string, role: 'adopter' | 'breeder'): Promise<any> {
        return this.hardDeleteUserUseCase.execute(adminId, userId, role);
    }

    // ================== 전화번호 화이트리스트 관리 ==================

    /**
     * 전화번호 화이트리스트 목록 조회
     *
     * 중복 가입이 허용되는 전화번호 목록을 조회합니다.
     *
     * @returns 화이트리스트 목록
     */
    async getPhoneWhitelist(): Promise<PhoneWhitelistListResponseDto> {
        return this.getPhoneWhitelistUseCase.execute();
    }

    /**
     * 전화번호 화이트리스트 추가
     *
     * 중복 가입을 허용할 전화번호를 화이트리스트에 추가합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param dto 추가할 전화번호 정보
     * @returns 추가된 화이트리스트 정보
     */
    async addPhoneWhitelist(adminId: string, dto: AddPhoneWhitelistRequestDto): Promise<PhoneWhitelistResponseDto> {
        return this.addPhoneWhitelistUseCase.execute(adminId, dto);
    }

    /**
     * 전화번호 화이트리스트 수정
     *
     * 화이트리스트 항목의 설명이나 활성 상태를 수정합니다.
     *
     * @param id 화이트리스트 항목 ID
     * @param dto 수정할 정보
     * @returns 수정된 화이트리스트 정보
     */
    async updatePhoneWhitelist(id: string, dto: UpdatePhoneWhitelistRequestDto): Promise<PhoneWhitelistResponseDto> {
        return this.updatePhoneWhitelistUseCase.execute(id, dto);
    }

    /**
     * 전화번호 화이트리스트 삭제
     *
     * 화이트리스트에서 전화번호를 삭제합니다.
     *
     * @param id 화이트리스트 항목 ID
     * @returns 삭제 결과 메시지
     */
    async deletePhoneWhitelist(id: string): Promise<{ message: string }> {
        return this.deletePhoneWhitelistUseCase.execute(id);
    }
}
