import { Inject, Injectable } from '@nestjs/common';

import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminApplicationDetailMapperService } from '../../domain/services/adopter-admin-application-detail-mapper.service';
import { ADOPTER_ADMIN_READER_PORT } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminApplicationDetailResult } from '../types/adopter-admin-result.type';

@Injectable()
export class GetAdopterAdminApplicationDetailUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER_PORT)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminApplicationDetailMapperService: AdopterAdminApplicationDetailMapperService,
    ) {}

    async execute(adminId: string, applicationId: string): Promise<AdopterAdminApplicationDetailResult> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanViewStatistics(admin);

        const application = await this.adopterAdminReader.findApplicationDetail(applicationId);
        const snapshot = this.adopterAdminPolicyService.assertApplicationExists(application);

        return this.adopterAdminApplicationDetailMapperService.toResult(snapshot);
    }
}
