import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';

import { OPS_PENDING_KIND, type OpsPendingKind } from '../../events/ops-pending.event';
import { AdoptionApplication } from '../../../schema/adoption-application.schema';
import { Breeder } from '../../../schema/breeder.schema';
import { BreederReview } from '../../../schema/breeder-review.schema';
import { CommunityPostReport } from '../../../schema/community-post-report.schema';

/**
 * 운영 대기의 "원본" 상태 조회.
 *
 * 알림 큐는 이벤트로 채우지만, 이벤트는 유실될 수 있다(적재 실패, 프로세스 종료).
 * 그래서 도메인 상태를 원본으로 두고 주기적으로 다시 맞춘다.
 * - 대기 중인데 큐에 없다 -> 뒤늦게라도 알린다
 * - 큐에는 열려 있는데 원본은 처리됐다 -> 리마인드를 멈춘다
 */
@Injectable()
export class OpsPendingSourceRepository {
    /** 한 번에 되짚어볼 최대 건수. 오래된 건까지 무한정 긁지 않는다 */
    private static readonly SCAN_LIMIT = 200;
    /** 되짚어볼 기간 (최근 14일). 그보다 오래 방치된 건은 알림이 아니라 정리 대상이다 */
    private static readonly SCAN_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly applicationModel: Model<AdoptionApplication>,
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<Breeder>,
        @InjectModel(BreederReview.name)
        private readonly reviewModel: Model<BreederReview>,
        @InjectModel(CommunityPostReport.name)
        private readonly communityReportModel: Model<CommunityPostReport>,
    ) {}

    /**
     * 지금 실제로 처리 대기인 원본들.
     *
     * 한 번에 보는 건수를 제한하므로, 매번 같은 앞자리만 보지 않도록 _id 커서로 이어서 읽는다.
     * 커서를 쓰지 않으면 대기 건이 한도보다 많을 때 뒤쪽이 영영 보정되지 않는다.
     */
    async listPendingReferenceIds(
        kind: OpsPendingKind,
        now: Date,
        afterId?: string,
    ): Promise<{ referenceIds: string[]; lastScannedId?: string; hasMore: boolean }> {
        const since = new Date(now.getTime() - OpsPendingSourceRepository.SCAN_WINDOW_MS);
        const limit = OpsPendingSourceRepository.SCAN_LIMIT;
        const cursor = afterId && Types.ObjectId.isValid(afterId) ? { _id: { $gt: new Types.ObjectId(afterId) } } : {};

        switch (kind) {
            case OPS_PENDING_KIND.ADOPTION_APPLICATION: {
                const rows = await this.applicationModel
                    .find({ status: 'consultation_pending', appliedAt: { $gte: since }, ...cursor }, { _id: 1 })
                    .sort({ _id: 1 })
                    .limit(limit)
                    .lean()
                    .exec();
                return this.toScanResult(
                    rows.map((row) => String(row._id)),
                    rows,
                    limit,
                );
            }
            case OPS_PENDING_KIND.BREEDER_VERIFICATION: {
                // 'pending' 은 서류 미제출이라 관리자가 할 일이 없다. 제출된 'reviewing' 만 대기다.
                const rows = await this.breederModel
                    .find(
                        { 'verification.status': 'reviewing', 'verification.submittedAt': { $gte: since }, ...cursor },
                        { _id: 1 },
                    )
                    .sort({ _id: 1 })
                    .limit(limit)
                    .lean()
                    .exec();
                return this.toScanResult(
                    rows.map((row) => String(row._id)),
                    rows,
                    limit,
                );
            }
            case OPS_PENDING_KIND.BREEDER_REPORT: {
                const rows = await this.breederModel
                    .find({ 'reports.status': 'pending', ...cursor }, { 'reports.reportId': 1, 'reports.status': 1 })
                    .sort({ _id: 1 })
                    .limit(limit)
                    .lean()
                    .exec();
                return this.toScanResult(
                    rows.flatMap((row) =>
                        (row.reports ?? [])
                            .filter((report) => report.status === 'pending')
                            .map((report) => String(report.reportId)),
                    ),
                    rows,
                    limit,
                );
            }
            case OPS_PENDING_KIND.REVIEW_REPORT: {
                // 관리자 처리(숨김)를 거치면 isVisible 이 false 가 된다
                const rows = await this.reviewModel
                    .find({ isReported: true, isVisible: true, reportedAt: { $gte: since }, ...cursor }, { _id: 1 })
                    .sort({ _id: 1 })
                    .limit(limit)
                    .lean()
                    .exec();
                return this.toScanResult(
                    rows.map((row) => String(row._id)),
                    rows,
                    limit,
                );
            }
            case OPS_PENDING_KIND.COMMUNITY_REPORT: {
                // 같은 글의 신고를 하나로 묶어 알리므로 referenceId 는 postId 다
                const rows = await this.communityReportModel
                    .find({ status: 'pending', createdAt: { $gte: since }, ...cursor }, { postId: 1 })
                    .sort({ _id: 1 })
                    .limit(limit)
                    .lean()
                    .exec();
                return this.toScanResult([...new Set(rows.map((row) => String(row.postId)))], rows, limit);
            }
            default:
                return { referenceIds: [], hasMore: false };
        }
    }

    /** 스캔 결과에 다음 커서를 붙인다 */
    private toScanResult(
        referenceIds: string[],
        rows: Array<{ _id: unknown }>,
        limit: number,
    ): { referenceIds: string[]; lastScannedId?: string; hasMore: boolean } {
        return {
            referenceIds,
            lastScannedId: rows.length > 0 ? String(rows[rows.length - 1]._id) : undefined,
            // 한도를 꽉 채웠으면 뒤에 더 있을 수 있으니 다음 주기에 이어서 본다
            hasMore: rows.length === limit,
        };
    }

    /** 이 건이 아직 처리 대기인지 (리마인드를 더 보내도 되는지) */
    async isStillPending(kind: string, referenceId: string): Promise<boolean> {
        switch (kind) {
            case OPS_PENDING_KIND.ADOPTION_APPLICATION: {
                if (!Types.ObjectId.isValid(referenceId)) return false;
                const count = await this.applicationModel
                    .countDocuments({ _id: new Types.ObjectId(referenceId), status: 'consultation_pending' })
                    .exec();
                return count > 0;
            }
            case OPS_PENDING_KIND.BREEDER_VERIFICATION: {
                if (!Types.ObjectId.isValid(referenceId)) return false;
                const count = await this.breederModel
                    .countDocuments({ _id: new Types.ObjectId(referenceId), 'verification.status': 'reviewing' })
                    .exec();
                return count > 0;
            }
            case OPS_PENDING_KIND.BREEDER_REPORT: {
                const count = await this.breederModel
                    .countDocuments({ reports: { $elemMatch: { reportId: referenceId, status: 'pending' } } })
                    .exec();
                return count > 0;
            }
            case OPS_PENDING_KIND.REVIEW_REPORT: {
                if (!Types.ObjectId.isValid(referenceId)) return false;
                const count = await this.reviewModel
                    .countDocuments({ _id: new Types.ObjectId(referenceId), isReported: true, isVisible: true })
                    .exec();
                return count > 0;
            }
            case OPS_PENDING_KIND.COMMUNITY_REPORT: {
                if (!Types.ObjectId.isValid(referenceId)) return false;
                const count = await this.communityReportModel
                    .countDocuments({ postId: new Types.ObjectId(referenceId), status: 'pending' })
                    .exec();
                return count > 0;
            }
            default:
                // 원본을 확인할 방법이 없는 종류는 이벤트만 믿는다 (임의로 닫지 않는다)
                return true;
        }
    }
}
