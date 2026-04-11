import { Injectable } from '@nestjs/common';

import { UserAdminDeletedReasonStatSnapshot, UserAdminDeletedUserStatsSnapshot } from '../../application/ports/user-admin-reader.port';
import type { UserAdminDeletedUserStatsResult } from '../../application/types/user-admin-result.type';

@Injectable()
export class UserAdminDeletedUserStatsResultMapperService {
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

    toResult(snapshot: UserAdminDeletedUserStatsSnapshot): UserAdminDeletedUserStatsResult {
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
