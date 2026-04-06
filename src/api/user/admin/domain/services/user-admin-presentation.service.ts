import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { DeletedUserResponseDto } from '../../dto/response/deleted-user-response.dto';
import { DeletedUserStatsResponseDto } from '../../dto/response/deleted-user-stats-response.dto';
import { PhoneWhitelistListResponseDto, PhoneWhitelistResponseDto } from '../../dto/response/phone-whitelist-response.dto';
import { UserManagementResponseDto } from '../../dto/response/user-management-response.dto';
import {
    UserAdminAdminSnapshot,
    UserAdminDeletedReasonStatSnapshot,
    UserAdminDeletedUserListResultSnapshot,
    UserAdminDeletedUserStatsSnapshot,
    UserAdminManagedUserRole,
    UserAdminPhoneWhitelistSnapshot,
    UserAdminUserListResultSnapshot,
} from '../../application/ports/user-admin-reader.port';

@Injectable()
export class UserAdminPresentationService {
    private readonly adopterReasonLabels: Record<string, string> = {
        already_adopted: '이미 입양을 마쳤어요',
        no_suitable_pet: '마음에 드는 아이가 없어요',
        adoption_fee_burden: '입양비가 부담돼요',
        uncomfortable_ui: '사용하기 불편했어요 (UI/기능 등)',
        privacy_concern: '개인정보나 보안이 걱정돼요',
        other: '기타',
    };

    private readonly breederReasonLabels: Record<string, string> = {
        no_inquiry: '입양 문의가 잘 오지 않았어요',
        time_consuming: '운영이 생각보다 번거롭거나 시간이 부족해요',
        verification_difficult: '브리더 심사나 검증 절차가 어려웠어요',
        policy_mismatch: '수익 구조나 서비스 정책이 잘 맞지 않아요',
        uncomfortable_ui: '사용하기 불편했어요 (UI/기능 등)',
        other: '기타',
    };

    toAdminProfileResponse(admin: UserAdminAdminSnapshot): any {
        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImage: admin.profileImage,
            status: admin.status,
            adminLevel: admin.adminLevel,
            permissions: admin.permissions,
            activityLogs: admin.activityLogs?.slice(-10) || [],
            createdAt: admin.createdAt,
        };
    }

    toUsersPaginationResponse(
        result: UserAdminUserListResultSnapshot,
        page: number,
        limit: number,
    ): PaginationResponseDto<UserManagementResponseDto> {
        const items = result.items.map(
            (user): UserManagementResponseDto => ({
                userId: user.id,
                userName: user.nickname || user.name || '',
                emailAddress: user.emailAddress,
                userRole: user.role,
                accountStatus: user.accountStatus,
                lastLoginAt: user.lastLoginAt as Date,
                createdAt: user.createdAt as Date,
                statisticsInfo: user.stats,
            }),
        );

        return new PaginationBuilder<UserManagementResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(result.total)
            .build();
    }

    toDeletedUsersPaginationResponse(
        result: UserAdminDeletedUserListResultSnapshot,
        page: number,
        limit: number,
    ): PaginationResponseDto<DeletedUserResponseDto> {
        const items = result.items.map(
            (user): DeletedUserResponseDto => ({
                userId: user.id,
                email: user.emailAddress,
                nickname: user.nickname || '',
                userRole: user.userRole,
                deleteReason: user.deleteReason || '',
                deleteReasonDetail: user.deleteReasonDetail,
                deletedAt: user.deletedAt ? new Date(user.deletedAt).toISOString() : '',
                createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
                phone: user.phoneNumber,
            }),
        );

        return new PaginationBuilder<DeletedUserResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(result.total)
            .build();
    }

    toDeletedUserStatsResponse(snapshot: UserAdminDeletedUserStatsSnapshot): DeletedUserStatsResponseDto {
        const totalDeletedUsers = snapshot.totalDeletedAdopters + snapshot.totalDeletedBreeders;

        return {
            totalDeletedUsers,
            totalDeletedAdopters: snapshot.totalDeletedAdopters,
            totalDeletedBreeders: snapshot.totalDeletedBreeders,
            adopterReasonStats: this.toReasonStats(
                snapshot.adopterReasonStats,
                snapshot.totalDeletedAdopters,
                this.adopterReasonLabels,
            ),
            breederReasonStats: this.toReasonStats(
                snapshot.breederReasonStats,
                snapshot.totalDeletedBreeders,
                this.breederReasonLabels,
            ),
            otherReasonDetails: snapshot.otherReasonDetails.sort(
                (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime(),
            ),
            last7DaysCount: snapshot.last7DaysCount,
            last30DaysCount: snapshot.last30DaysCount,
        };
    }

    toRestoreDeletedUserResponse(
        userId: string,
        role: UserAdminManagedUserRole,
        previousStatus: string,
        updatedAt: Date,
    ) {
        return {
            userId,
            role,
            previousStatus,
            newStatus: 'active',
            updatedAt: updatedAt.toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 계정이 복구되었습니다.`,
        };
    }

    toHardDeleteUserResponse(
        userId: string,
        role: UserAdminManagedUserRole,
        userName: string,
        userEmail: string,
    ) {
        return {
            userId,
            role,
            userName,
            userEmail,
            deletedAt: new Date().toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 데이터가 영구적으로 삭제되었습니다.`,
        };
    }

    toPhoneWhitelistListResponse(items: UserAdminPhoneWhitelistSnapshot[]): PhoneWhitelistListResponseDto {
        return {
            items: items.map((item) => this.toPhoneWhitelistResponse(item)),
            total: items.length,
        };
    }

    toPhoneWhitelistResponse(item: UserAdminPhoneWhitelistSnapshot): PhoneWhitelistResponseDto {
        return {
            id: item.id,
            phoneNumber: item.phoneNumber,
            description: item.description,
            isActive: item.isActive,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }

    private toReasonStats(
        stats: UserAdminDeletedReasonStatSnapshot[],
        total: number,
        labels: Record<string, string>,
    ) {
        return stats
            .map((stat) => ({
                reason: stat.reason,
                reasonLabel: labels[stat.reason] || stat.reason,
                count: stat.count,
                percentage: total > 0 ? Math.round((stat.count / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);
    }
}
