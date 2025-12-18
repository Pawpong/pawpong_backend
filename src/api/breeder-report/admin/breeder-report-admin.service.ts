import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

import { AdminAction, AdminTargetType } from '../../../common/enum/user.enum';
import { PaginationBuilder } from '../../../common/dto/pagination/pagination-builder.dto';

import { ReportListRequestDto } from './dto/request/report-list-request.dto';
import { ReportActionRequestDto } from './dto/request/report-action-request.dto';
import { ReportListResponseDto } from './dto/response/report-list-response.dto';
import { ReportActionResponseDto } from './dto/response/report-action-response.dto';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { BreederReport, BreederReportDocument } from '../../../schema/breeder-report.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

/**
 * 브리더 신고 관리 Admin 서비스
 *
 * 관리자가 브리더 신고를 관리하는 비즈니스 로직을 제공합니다.
 */
@Injectable()
export class BreederReportAdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(BreederReport.name) private breederReportModel: Model<BreederReportDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
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
     * 브리더 신고 목록 조회
     *
     * @param adminId 관리자 고유 ID
     * @param filter 필터 (상태, 페이지네이션)
     * @returns 신고 목록
     */
    async getReports(adminId: string, filter: ReportListRequestDto): Promise<any> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('Access denied');
        }

        const { status, pageNumber = 1, itemsPerPage = 10 } = filter;
        const skip = (pageNumber - 1) * itemsPerPage;

        // Breeder 컬렉션의 임베딩된 reports 배열에서 조회
        const matchQuery: any = { 'reports.0': { $exists: true } };
        if (status) {
            matchQuery['reports.status'] = status;
        }

        // Aggregation pipeline으로 임베딩된 신고 데이터 조회
        const pipeline: any[] = [{ $match: matchQuery }, { $unwind: '$reports' }];

        if (status) {
            pipeline.push({ $match: { 'reports.status': status } });
        }

        pipeline.push(
            { $sort: { 'reports.reportedAt': -1 } },
            {
                $project: {
                    reportId: '$reports.reportId',
                    targetId: '$_id',
                    targetName: '$nickname',
                    type: '$reports.type',
                    description: '$reports.description',
                    status: '$reports.status',
                    reportedAt: '$reports.reportedAt',
                    adminNotes: '$reports.adminNotes',
                },
            },
        );

        const [allReports, countResult] = await Promise.all([
            this.breederModel.aggregate(pipeline),
            this.breederModel.aggregate([...pipeline.slice(0, -1), { $count: 'total' }]),
        ]);

        const totalCount = countResult[0]?.total || 0;
        const items = allReports.slice(skip, skip + itemsPerPage);

        return new PaginationBuilder<ReportListResponseDto>()
            .setItems(items)
            .setPage(pageNumber)
            .setTake(itemsPerPage)
            .setTotalCount(totalCount)
            .build();
    }

    /**
     * 브리더 신고 처리
     *
     * @param adminId 관리자 고유 ID
     * @param reportId 신고 고유 ID
     * @param actionData 처리 액션 데이터
     * @returns 처리 결과
     */
    async handleReport(
        adminId: string,
        reportId: string,
        actionData: ReportActionRequestDto,
    ): Promise<ReportActionResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('Access denied');
        }

        // Breeder 컬렉션에서 임베딩된 신고 찾기
        const breeder = await this.breederModel.findOne({ 'reports.reportId': reportId });
        if (!breeder) {
            throw new BadRequestException('신고를 찾을 수 없습니다.');
        }

        const report = breeder.reports.find((r: any) => r.reportId === reportId);
        if (!report) {
            throw new BadRequestException('신고를 찾을 수 없습니다.');
        }

        if (report.status !== 'pending') {
            throw new BadRequestException('이미 처리된 신고입니다.');
        }

        // 신고 상태 업데이트
        const newStatus = actionData.action === 'resolve' ? 'resolved' : 'dismissed';
        report.status = newStatus;
        report.adminNotes = actionData.adminNotes;

        // 승인 시 브리더 제재 처리
        if (actionData.action === 'resolve') {
            breeder.accountStatus = 'suspended';
            breeder.suspensionReason = `신고 승인: ${actionData.adminNotes || '관리자 조치'}`;
            breeder.suspendedAt = new Date();

            await this.logAdminActivity(
                adminId,
                AdminAction.RESOLVE_REPORT,
                AdminTargetType.BREEDER,
                (breeder._id as any).toString(),
                breeder.nickname,
                `Report resolved: ${actionData.adminNotes || 'No notes'}`,
            );
        } else {
            await this.logAdminActivity(
                adminId,
                AdminAction.DISMISS_REPORT,
                AdminTargetType.BREEDER,
                (breeder._id as any).toString(),
                breeder.nickname,
                `Report dismissed: ${actionData.adminNotes || 'No notes'}`,
            );
        }

        await breeder.save();

        return {
            reportId: reportId,
            breederId: (breeder._id as any).toString(),
            action: actionData.action,
            status: newStatus,
            adminNotes: actionData.adminNotes,
            processedAt: new Date(),
        };
    }
}
