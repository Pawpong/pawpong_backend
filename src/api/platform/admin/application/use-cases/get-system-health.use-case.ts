import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../../schema/admin.schema';
import { LOKI_QUERY_PORT } from '../ports/loki-query.port';
import type { ILokiQueryPort } from '../ports/loki-query.port';
import { LogCategorizerService } from '../../domain/services/log-categorizer.service';
import type { CategorizationResult } from '../../domain/services/log-categorizer.service';
import { SystemHealthFilterRequestDto } from '../../dto/request/system-health-filter-request.dto';

/**
 * 시스템 헬스 조회 Use Case
 *
 * 오케스트레이션 책임:
 * 1. 관리자 권한 확인
 * 2. Loki에서 error/warn 로그 조회 (Port 경유)
 * 3. Domain Service로 분류 및 그룹핑
 * 4. 결과 반환
 */
@Injectable()
export class GetSystemHealthUseCase {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @Inject(LOKI_QUERY_PORT) private readonly lokiQueryPort: ILokiQueryPort,
        private readonly logCategorizerService: LogCategorizerService,
    ) {}

    /**
     * 시스템 헬스 데이터를 조회합니다.
     *
     * @param adminId 요청한 관리자 ID
     * @param filter 기간 필터 (기본 24시간)
     * @returns 분류된 시스템 헬스 요약
     */
    async execute(adminId: string, filter: SystemHealthFilterRequestDto): Promise<CategorizationResult> {
        await this.verifyAdminPermission(adminId);

        const now = new Date();
        const periodHours = filter.periodHours ?? 24;
        const from = new Date(now.getTime() - periodHours * 60 * 60 * 1000).toISOString();
        const to = now.toISOString();

        const entries = await this.lokiQueryPort.queryErrorsAndWarnings({
            from,
            to,
            limit: 1000,
        });

        return this.logCategorizerService.categorize(entries, now);
    }

    /**
     * 관리자 통계 조회 권한을 확인합니다.
     */
    private async verifyAdminPermission(adminId: string): Promise<void> {
        const admin = await this.adminModel.findById(adminId).lean();
        if (!admin || !admin.permissions.canViewStatistics) {
            throw new ForbiddenException('시스템 헬스 조회 권한이 없습니다.');
        }
    }
}
