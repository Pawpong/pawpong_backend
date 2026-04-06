import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_VERIFICATION_ADMIN_READER } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminPresentationService } from '../../domain/services/breeder-verification-admin-presentation.service';

@Injectable()
export class GetBreederStatsUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminPresentationService: BreederVerificationAdminPresentationService,
    ) {}

    async execute(adminId: string) {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            '브리더 관리 권한이 없습니다.',
        );

        return this.breederVerificationAdminPresentationService.toBreederStatsResponse(
            await this.breederVerificationAdminReader.getApprovedBreederStats(),
        );
    }
}
