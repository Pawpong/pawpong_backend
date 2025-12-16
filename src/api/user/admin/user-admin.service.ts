import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

import { UserStatus, AdminAction, AdminTargetType } from '../../../common/enum/user.enum';
import { StorageService } from '../../../common/storage/storage.service';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { AuthBanner, AuthBannerDocument } from '../../../schema/auth-banner.schema';

import { UserSearchRequestDto } from './dto/request/user-search-request.dto';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { DeletedUserSearchRequestDto } from './dto/request/deleted-user-search-request.dto';
import { UserManagementResponseDto } from './dto/response/user-management-response.dto';
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
        @InjectModel(AuthBanner.name) private authBannerModel: Model<AuthBannerDocument>,
        private readonly storageService: StorageService,
    ) {}

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

        const { userRole, accountStatus, searchKeyword, pageNumber = 1, itemsPerPage = 10 } = filter;
        const skip = (pageNumber - 1) * itemsPerPage;

        let users: any[] = [];
        let total = 0;

        if (!userRole || userRole === 'adopter') {
            const adopterQuery: any = {};
            if (accountStatus) adopterQuery.account_status = accountStatus;
            if (searchKeyword) {
                adopterQuery.$or = [
                    { full_name: new RegExp(searchKeyword, 'i') },
                    { email_address: new RegExp(searchKeyword, 'i') },
                ];
            }

            const [adopterResults, adopterTotal] = await Promise.all([
                this.adopterModel
                    .find(adopterQuery)
                    .select('full_name email_address account_status last_activity_at created_at')
                    .sort({ createdAt: -1 })
                    .skip(userRole === 'adopter' ? skip : 0)
                    .limit(userRole === 'adopter' ? itemsPerPage : itemsPerPage / 2)
                    .lean(),
                this.adopterModel.countDocuments(adopterQuery),
            ]);

            users.push(...adopterResults.map((user) => ({ ...user, role: 'adopter' })));
            total += adopterTotal;
        }

        if (!userRole || userRole === 'breeder') {
            const breederQuery: any = {};
            if (accountStatus) breederQuery.status = accountStatus;
            if (searchKeyword) {
                breederQuery.$or = [
                    { name: new RegExp(searchKeyword, 'i') },
                    { email: new RegExp(searchKeyword, 'i') },
                ];
            }

            const [breederResults, breederTotal] = await Promise.all([
                this.breederModel
                    .find(breederQuery)
                    .select('name email status lastLoginAt createdAt stats')
                    .sort({ createdAt: -1 })
                    .skip(userRole === 'breeder' ? skip : 0)
                    .limit(userRole === 'breeder' ? itemsPerPage : itemsPerPage / 2)
                    .lean(),
                this.breederModel.countDocuments(breederQuery),
            ]);

            users.push(...breederResults.map((user) => ({ ...user, role: 'breeder' })));
            total += breederTotal;
        }

        const items = users.map(
            (user): UserManagementResponseDto => ({
                userId: (user._id as any).toString(),
                userName: user.full_name || user.name,
                emailAddress: user.email_address || user.email,
                userRole: user.role,
                accountStatus: user.account_status || user.status,
                lastLoginAt: user.last_activity_at || user.lastLoginAt,
                createdAt: user.created_at || user.createdAt,
                statisticsInfo: user.stats,
            }),
        );

        return new PaginationBuilder<UserManagementResponseDto>()
            .setItems(items)
            .setPage(pageNumber)
            .setTake(itemsPerPage)
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

        if (role === 'adopter') {
            user.account_status = userData.accountStatus;
        } else {
            user.status = userData.accountStatus;
        }
        await user.save();

        const action =
            userData.accountStatus === UserStatus.SUSPENDED ? AdminAction.SUSPEND_USER : AdminAction.ACTIVATE_USER;

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

        const { role, deleteReason, page = 1, pageSize = 20 } = filter;
        const skip = (page - 1) * pageSize;

        let users: any[] = [];
        let total = 0;

        // 탈퇴 사용자 조건: accountStatus가 'deleted'인 사용자
        if (!role || role === 'all' || role === 'adopter') {
            const adopterQuery: any = { accountStatus: 'deleted' };
            if (deleteReason) adopterQuery.deleteReason = deleteReason;

            const [adopterResults, adopterTotal] = await Promise.all([
                this.adopterModel
                    .find(adopterQuery)
                    .select('email name phone deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'adopter' ? skip : 0)
                    .limit(role === 'adopter' ? pageSize : Math.ceil(pageSize / 2))
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
                    .select('email name phone deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'breeder' ? skip : 0)
                    .limit(role === 'breeder' ? pageSize : Math.ceil(pageSize / 2))
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
            users = users.slice(skip, skip + pageSize);
        }

        const items = users.map(
            (user): DeletedUserResponseDto => ({
                userId: (user._id as any).toString(),
                email: user.email,
                nickname: user.name,
                userRole: user.userRole,
                deleteReason: user.deleteReason || '',
                deleteReasonDetail: user.deleteReasonDetail,
                deletedAt: user.deletedAt ? new Date(user.deletedAt).toISOString() : '',
                createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
                phone: user.phone,
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
            .setTake(pageSize)
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

        // 탈퇴 사유별 통계 조회
        const [adopterReasonStats, breederReasonStats] = await Promise.all([
            this.adopterModel.aggregate([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
            this.breederModel.aggregate([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
        ]);

        // 사유별 통계 병합
        const reasonStatsMap = new Map<string, number>();
        [...adopterReasonStats, ...breederReasonStats].forEach((stat) => {
            const currentCount = reasonStatsMap.get(stat._id) || 0;
            reasonStatsMap.set(stat._id, currentCount + stat.count);
        });

        const reasonStats = Array.from(reasonStatsMap.entries()).map(([reason, count]) => ({
            reason,
            count,
            percentage: totalDeletedUsers > 0 ? Math.round((count / totalDeletedUsers) * 100) : 0,
        }));

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
            reasonStats: reasonStats.sort((a, b) => b.count - a.count),
            last7DaysCount: last7DaysAdopters + last7DaysBreeders,
            last30DaysCount: last30DaysAdopters + last30DaysBreeders,
        };
    }
}
