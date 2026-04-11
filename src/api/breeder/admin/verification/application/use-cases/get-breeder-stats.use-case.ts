import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminStatsPresentationService } from '../../domain/services/breeder-verification-admin-stats-presentation.service';

@Injectable()
export class GetBreederStatsUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER_PORT)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminStatsPresentationService: BreederVerificationAdminStatsPresentationService,
    ) {}

    async execute(adminId: string) {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            '브리더 관리 권한이 없습니다.',
        );

        return this.breederVerificationAdminStatsPresentationService.toBreederStatsResponse(
            await this.breederVerificationAdminReader.getApprovedBreederStats(),
        );
    }
}
