import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

import { UserStatus, AdminAction, AdminTargetType } from '../../../common/enum/user.enum';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';

import { UserSearchRequestDto } from './dto/request/user-search-request.dto';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { DeletedUserSearchRequestDto } from './dto/request/deleted-user-search-request.dto';
import { UserManagementResponseDto } from './dto/response/user-management-response.dto';
import { UserStatusUpdateResponseDto } from './dto/response/user-status-update-response.dto';
import { DeletedUserResponseDto } from './dto/response/deleted-user-response.dto';
import { DeletedUserStatsResponseDto } from './dto/response/deleted-user-stats-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { PaginationBuilder } from '../../../common/dto/pagination/pagination-builder.dto';

/**
 * 사용자 관리 Admin 서비스
 *
 * 사용자 관리 관련 관리자 기능을 제공합니다:
 * - 관리자 프로필 관리
 * - 통합 사용자 관리 (입양자 + 브리더)
 * - 사용자 상태 변경
 */
@Injectable()
export class UserAdminService {
    // 허용되는 이미지 MIME 타입
    private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
    ) {}

    /**
     * 관리자 프로필 조회
     *
     * @param adminId 관리자 고유 ID
     * @returns 관리자 프로필 정보
     */
    async getAdminProfile(adminId: string): Promise<any> {
        const admin = await this.adminModel.findById(adminId).select('-password').lean();
        if (!admin) {
            throw new BadRequestException('관리자를 찾을 수 없습니다.');
        }

        return {
            id: (admin._id as any).toString(),
            name: admin.name,
            email: admin.email,
            profileImage: admin.profileImage,
            status: admin.status,
            adminLevel: admin.adminLevel,
            permissions: admin.permissions,
            activityLogs: admin.activityLogs?.slice(-10) || [], // Last 10 activities
            createdAt: (admin as any).createdAt,
        };
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
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageUsers) {
            throw new ForbiddenException('Access denied');
        }

        const { userRole, accountStatus, searchKeyword, page = 1, limit = 10 } = filter;
        const skip = (page - 1) * limit;

        let users: any[] = [];
        let total = 0;

        if (!userRole || userRole === 'adopter') {
            const adopterQuery: any = {};
            if (accountStatus) adopterQuery.accountStatus = accountStatus;
            if (searchKeyword) {
                adopterQuery.$or = [
                    { nickname: new RegExp(searchKeyword, 'i') },
                    { emailAddress: new RegExp(searchKeyword, 'i') },
                ];
            }

            const [adopterResults, adopterTotal] = await Promise.all([
                this.adopterModel
                    .find(adopterQuery)
                    .select('nickname emailAddress accountStatus lastLoginAt createdAt')
                    .sort({ createdAt: -1 })
                    .skip(userRole === 'adopter' ? skip : 0)
                    .limit(userRole === 'adopter' ? limit : limit / 2)
                    .lean(),
                this.adopterModel.countDocuments(adopterQuery),
            ]);

            users.push(...adopterResults.map((user) => ({ ...user, role: 'adopter' })));
            total += adopterTotal;
        }

        if (!userRole || userRole === 'breeder') {
            const breederQuery: any = {};
            if (accountStatus) breederQuery.accountStatus = accountStatus;
            if (searchKeyword) {
                breederQuery.$or = [
                    { name: new RegExp(searchKeyword, 'i') },
                    { emailAddress: new RegExp(searchKeyword, 'i') },
                ];
            }

            const [breederResults, breederTotal] = await Promise.all([
                this.breederModel
                    .find(breederQuery)
                    .select('name emailAddress accountStatus lastLoginAt createdAt stats')
                    .sort({ createdAt: -1 })
                    .skip(userRole === 'breeder' ? skip : 0)
                    .limit(userRole === 'breeder' ? limit : limit / 2)
                    .lean(),
                this.breederModel.countDocuments(breederQuery),
            ]);

            users.push(...breederResults.map((user) => ({ ...user, role: 'breeder' })));
            total += breederTotal;
        }

        const items = users.map(
            (user): UserManagementResponseDto => ({
                userId: (user._id as any).toString(),
                userName: user.nickname || user.name,
                emailAddress: user.emailAddress,
                userRole: user.role,
                accountStatus: user.accountStatus,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                statisticsInfo: user.stats,
            }),
        );

        return new PaginationBuilder<UserManagementResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(total)
            .build();
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
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageUsers) {
            throw new ForbiddenException('Access denied');
        }

        let user: any;
        if (role === 'adopter') {
            user = await this.adopterModel.findById(userId);
        } else {
            user = await this.breederModel.findById(userId);
        }

        if (!user) {
            throw new BadRequestException(`${role === 'adopter' ? '입양자를' : '브리더를'} 찾을 수 없습니다.`);
        }

        // 계정 상태 업데이트
        user.accountStatus = userData.accountStatus;

        // deleted 상태로 변경 시 deletedAt 설정
        if (userData.accountStatus === 'deleted') {
            user.deletedAt = new Date();
        } else {
            user.deletedAt = undefined;
        }

        await user.save();

        const action =
            userData.accountStatus === UserStatus.SUSPENDED
                ? AdminAction.SUSPEND_USER
                : userData.accountStatus === UserStatus.DELETED
                  ? AdminAction.DELETE_USER
                  : AdminAction.ACTIVATE_USER;

        await this.logAdminActivity(
            adminId,
            action,
            role === 'adopter' ? AdminTargetType.ADOPTER : AdminTargetType.BREEDER,
            userId,
            user.full_name || user.name,
            userData.actionReason || `User status changed to ${userData.accountStatus}`,
        );

        return { message: `${role} status updated to ${userData.accountStatus}` };
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
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageUsers) {
            throw new ForbiddenException('사용자 관리 권한이 없습니다.');
        }

        const { role, deleteReason, page = 1, limit = 20 } = filter;
        const skip = (page - 1) * limit;

        let users: any[] = [];
        let total = 0;

        // 탈퇴 사용자 조건: accountStatus가 'deleted'인 사용자
        if (!role || role === 'all' || role === 'adopter') {
            const adopterQuery: any = { accountStatus: 'deleted' };
            if (deleteReason) adopterQuery.deleteReason = deleteReason;

            const [adopterResults, adopterTotal] = await Promise.all([
                this.adopterModel
                    .find(adopterQuery)
                    .select('emailAddress nickname phoneNumber deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'adopter' ? skip : 0)
                    .limit(role === 'adopter' ? limit : Math.ceil(limit / 2))
                    .lean(),
                this.adopterModel.countDocuments(adopterQuery),
            ]);

            users.push(...adopterResults.map((user) => ({ ...user, userRole: 'adopter' })));
            total += adopterTotal;
        }

        if (!role || role === 'all' || role === 'breeder') {
            const breederQuery: any = { accountStatus: 'deleted' };
            if (deleteReason) breederQuery.deleteReason = deleteReason;

            const [breederResults, breederTotal] = await Promise.all([
                this.breederModel
                    .find(breederQuery)
                    .select('emailAddress nickname phoneNumber deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'breeder' ? skip : 0)
                    .limit(role === 'breeder' ? limit : Math.ceil(limit / 2))
                    .lean(),
                this.breederModel.countDocuments(breederQuery),
            ]);

            users.push(...breederResults.map((user) => ({ ...user, userRole: 'breeder' })));
            total += breederTotal;
        }

        // 탈퇴 일시 기준으로 정렬
        users.sort((a, b) => {
            const dateA = new Date(a.deletedAt || 0).getTime();
            const dateB = new Date(b.deletedAt || 0).getTime();
            return dateB - dateA;
        });

        // 페이지네이션 적용 (role이 'all'인 경우)
        if (role === 'all') {
            users = users.slice(skip, skip + limit);
        }

        const items = users.map(
            (user): DeletedUserResponseDto => ({
                userId: (user._id as any).toString(),
                email: user.emailAddress,
                nickname: user.nickname,
                userRole: user.userRole,
                deleteReason: user.deleteReason || '',
                deleteReasonDetail: user.deleteReasonDetail,
                deletedAt: user.deletedAt ? new Date(user.deletedAt).toISOString() : '',
                createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
                phone: user.phoneNumber,
            }),
        );

        await this.logAdminActivity(
            adminId,
            AdminAction.VIEW_USER_LIST,
            AdminTargetType.SYSTEM,
            'deleted-users',
            undefined,
            `탈퇴 사용자 목록 조회 (role: ${role}, page: ${page})`,
        );

        return new PaginationBuilder<DeletedUserResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(total)
            .build();
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
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageUsers) {
            throw new ForbiddenException('사용자 관리 권한이 없습니다.');
        }

        // 전체 탈퇴자 수 조회
        const [totalDeletedAdopters, totalDeletedBreeders] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: 'deleted' }),
            this.breederModel.countDocuments({ accountStatus: 'deleted' }),
        ]);

        const totalDeletedUsers = totalDeletedAdopters + totalDeletedBreeders;

        // 탈퇴 사유별 통계 조회 (입양자/브리더 분리)
        const [adopterReasonStatsRaw, breederReasonStatsRaw] = await Promise.all([
            this.adopterModel.aggregate([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
            this.breederModel.aggregate([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
        ]);

        // 입양자 탈퇴 사유 라벨 매핑 (프론트엔드와 동일하게 유지)
        const adopterReasonLabels: Record<string, string> = {
            already_adopted: '이미 입양을 마쳤어요',
            no_suitable_pet: '마음에 드는 아이가 없어요',
            adoption_fee_burden: '입양비가 부담돼요',
            uncomfortable_ui: '사용하기 불편했어요 (UI/기능 등)',
            privacy_concern: '개인정보나 보안이 걱정돼요',
            other: '기타',
        };

        // 브리더 탈퇴 사유 라벨 매핑 (프론트엔드와 동일하게 유지)
        const breederReasonLabels: Record<string, string> = {
            no_inquiry: '입양 문의가 잘 오지 않았어요',
            time_consuming: '운영이 생각보다 번거롭거나 시간이 부족해요',
            verification_difficult: '브리더 심사나 검증 절차가 어려웠어요',
            policy_mismatch: '수익 구조나 서비스 정책이 잘 맞지 않아요',
            uncomfortable_ui: '사용하기 불편했어요 (UI/기능 등)',
            other: '기타',
        };

        // 입양자 사유별 통계
        const adopterReasonStats = adopterReasonStatsRaw
            .map((stat) => ({
                reason: stat._id,
                reasonLabel: adopterReasonLabels[stat._id] || stat._id,
                count: stat.count,
                percentage: totalDeletedAdopters > 0 ? Math.round((stat.count / totalDeletedAdopters) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 브리더 사유별 통계
        const breederReasonStats = breederReasonStatsRaw
            .map((stat) => ({
                reason: stat._id,
                reasonLabel: breederReasonLabels[stat._id] || stat._id,
                count: stat.count,
                percentage: totalDeletedBreeders > 0 ? Math.round((stat.count / totalDeletedBreeders) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 기타 사유 상세 목록 조회 (최대 50개)
        const [adopterOtherReasons, breederOtherReasons] = await Promise.all([
            this.adopterModel
                .find({
                    accountStatus: 'deleted',
                    deleteReason: 'other',
                    deleteReasonDetail: { $exists: true, $ne: null },
                })
                .select('deleteReasonDetail deletedAt')
                .sort({ deletedAt: -1 })
                .limit(25)
                .lean()
                .exec(),
            this.breederModel
                .find({
                    accountStatus: 'deleted',
                    deleteReason: 'other',
                    deleteReasonDetail: { $exists: true, $ne: null },
                })
                .select('deleteReasonDetail deletedAt')
                .sort({ deletedAt: -1 })
                .limit(25)
                .lean()
                .exec(),
        ]);

        const otherReasonDetails = [
            ...adopterOtherReasons.map((item: any) => ({
                userType: 'adopter' as const,
                reason: item.deleteReasonDetail,
                deletedAt: item.deletedAt.toISOString(),
            })),
            ...breederOtherReasons.map((item: any) => ({
                userType: 'breeder' as const,
                reason: item.deleteReasonDetail,
                deletedAt: item.deletedAt.toISOString(),
            })),
        ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

        // 최근 7일, 30일 탈퇴자 수 조회
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [last7DaysAdopters, last7DaysBreeders, last30DaysAdopters, last30DaysBreeders] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: sevenDaysAgo } }),
            this.breederModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: sevenDaysAgo } }),
            this.adopterModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: thirtyDaysAgo } }),
            this.breederModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: thirtyDaysAgo } }),
        ]);

        await this.logAdminActivity(
            adminId,
            AdminAction.VIEW_STATISTICS,
            AdminTargetType.SYSTEM,
            'deleted-users-stats',
            undefined,
            '탈퇴 사용자 통계 조회',
        );

        return {
            totalDeletedUsers,
            totalDeletedAdopters,
            totalDeletedBreeders,
            adopterReasonStats,
            breederReasonStats,
            otherReasonDetails,
            last7DaysCount: last7DaysAdopters + last7DaysBreeders,
            last30DaysCount: last30DaysAdopters + last30DaysBreeders,
        };
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
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageUsers) {
            throw new ForbiddenException('사용자 관리 권한이 없습니다.');
        }

        const user =
            role === 'adopter' ? await this.adopterModel.findById(userId) : await this.breederModel.findById(userId);

        if (!user) {
            throw new BadRequestException(`${role === 'adopter' ? '입양자를' : '브리더를'} 찾을 수 없습니다.`);
        }

        if (user.accountStatus !== 'deleted') {
            throw new BadRequestException('탈퇴 상태가 아닌 사용자입니다.');
        }

        const previousStatus = user.accountStatus;
        const updatedAt = new Date();

        // 계정 상태를 active로 복구하고 탈퇴 관련 정보 초기화
        user.accountStatus = 'active';
        user.deletedAt = undefined;
        user.deleteReason = undefined;
        user.deleteReasonDetail = undefined;
        await user.save();

        await this.logAdminActivity(
            adminId,
            AdminAction.ACTIVATE_USER,
            role === 'adopter' ? AdminTargetType.ADOPTER : AdminTargetType.BREEDER,
            userId,
            user.nickname,
            '탈퇴 사용자 복구',
        );

        return {
            userId,
            role,
            previousStatus,
            newStatus: 'active',
            updatedAt: updatedAt.toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 계정이 복구되었습니다.`,
        };
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
        const admin = await this.adminModel.findById(adminId);
        if (!admin || admin.adminLevel !== 'super_admin') {
            throw new ForbiddenException('super_admin 권한이 필요합니다.');
        }

        const user =
            role === 'adopter' ? await this.adopterModel.findById(userId) : await this.breederModel.findById(userId);

        if (!user) {
            throw new BadRequestException(`${role === 'adopter' ? '입양자를' : '브리더를'} 찾을 수 없습니다.`);
        }

        if (user.accountStatus !== 'deleted') {
            throw new BadRequestException('deleted 상태의 사용자만 영구 삭제할 수 있습니다.');
        }

        // 브리더는 name 필드, 입양자는 nickname 필드 사용
        const userName =
            role === 'breeder' ? ((user as any).name || user.nickname || '알 수 없음') : (user.nickname || '알 수 없음');
        const userEmail = user.emailAddress || '';

        // 관리자 활동 로그 먼저 기록 (삭제 전에)
        await this.logAdminActivity(
            adminId,
            AdminAction.DELETE_USER,
            role === 'adopter' ? AdminTargetType.ADOPTER : AdminTargetType.BREEDER,
            userId,
            userName,
            `영구 삭제 (이메일: ${userEmail})`,
        );

        // DB에서 완전히 삭제
        if (role === 'adopter') {
            await this.adopterModel.findByIdAndDelete(userId);
        } else {
            await this.breederModel.findByIdAndDelete(userId);
        }

        return {
            userId,
            role,
            userName,
            userEmail,
            deletedAt: new Date().toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 데이터가 영구적으로 삭제되었습니다.`,
        };
    }

    /**
     * 관리자 활동 로그 기록
     * @private
     */
    private async logAdminActivity(
        adminId: string,
        action: AdminAction,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): Promise<void> {
        const admin = await this.adminModel.findById(adminId);
        if (admin) {
            const logEntry = {
                logId: randomUUID(),
                action,
                targetType,
                targetId,
                targetName,
                description: description || `${action} performed on ${targetType} ${targetName || targetId}`,
                performedAt: new Date(),
            };
            admin.activityLogs.push(logEntry);
            await admin.save();
        }
    }
}
