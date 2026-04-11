import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminDetailPresentationService } from '../../domain/services/breeder-verification-admin-presentation.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';

@Injectable()
export class GetBreederDetailUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER_PORT)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminDetailPresentationService: BreederVerificationAdminDetailPresentationService,
    ) {}

    async execute(adminId: string, breederId: string) {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            '브리더 관리 권한이 없습니다.',
        );

        const breeder = this.breederVerificationAdminPolicyService.assertBreederExists(
            await this.breederVerificationAdminReader.findBreederById(breederId),
        );

        return this.breederVerificationAdminDetailPresentationService.toBreederDetailResponse(breeder);
    }
}
