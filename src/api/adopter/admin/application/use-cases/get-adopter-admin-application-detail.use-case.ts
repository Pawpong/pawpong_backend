import { Inject, Injectable } from '@nestjs/common';

import { AdminApplicationDetailResponseDto } from '../../dto/response/application-detail-response.dto';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminPresentationService } from '../../domain/services/adopter-admin-presentation.service';
import { ADOPTER_ADMIN_READER } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';

@Injectable()
export class GetAdopterAdminApplicationDetailUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminPresentationService: AdopterAdminPresentationService,
    ) {}

    async execute(adminId: string, applicationId: string): Promise<AdminApplicationDetailResponseDto> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanViewStatistics(admin);
        this.adopterAdminPolicyService.assertApplicationIdFormat(applicationId);

        const application = await this.adopterAdminReader.findApplicationDetail(applicationId);
        const snapshot = this.adopterAdminPolicyService.assertApplicationExists(application);

        return this.adopterAdminPresentationService.toApplicationDetail(snapshot);
    }
}
