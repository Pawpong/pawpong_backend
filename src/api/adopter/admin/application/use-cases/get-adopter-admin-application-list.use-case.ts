import { Inject, Injectable } from '@nestjs/common';

import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminPresentationService } from '../../domain/services/adopter-admin-presentation.service';
import { ADOPTER_ADMIN_READER_PORT } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminApplicationListQuery } from '../types/adopter-admin-application-query.type';
import type { AdopterAdminApplicationListResult } from '../types/adopter-admin-result.type';

@Injectable()
export class GetAdopterAdminApplicationListUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER_PORT)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminPresentationService: AdopterAdminPresentationService,
    ) {}

    async execute(adminId: string, filters: AdopterAdminApplicationListQuery): Promise<AdopterAdminApplicationListResult> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanViewStatistics(admin);

        const snapshot = await this.adopterAdminReader.findApplicationList({
            page: filters.page || 1,
            limit: filters.limit || 10,
            status: filters.status,
            breederName: filters.breederName,
            startDate: filters.startDate,
            endDate: filters.endDate,
        });

        return this.adopterAdminPresentationService.toApplicationList(snapshot);
    }
}
