import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminListPaginationService } from '../../domain/services/breeder-verification-admin-list-pagination.service';
import { BreederVerificationAdminPendingBreederListPresentationService } from '../../domain/services/breeder-verification-admin-pending-breeder-list-presentation.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import type { BreederVerificationAdminSearchQuery } from '../types/breeder-verification-admin-command.type';

@Injectable()
export class GetPendingBreederVerificationsUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER_PORT)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminPendingBreederListPresentationService: BreederVerificationAdminPendingBreederListPresentationService,
        private readonly breederVerificationAdminListPaginationService: BreederVerificationAdminListPaginationService,
    ) {}

    async execute(adminId: string, filter: BreederVerificationAdminSearchQuery) {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const pageNumber = filter.pageNumber ?? 1;
        const itemsPerPage = filter.itemsPerPage ?? 10;
        const result = await this.breederVerificationAdminReader.getPendingBreeders({
            verificationStatus: filter.verificationStatus,
            cityName: filter.cityName,
            searchKeyword: filter.searchKeyword,
            pageNumber,
            itemsPerPage,
        });

        return this.breederVerificationAdminListPaginationService.toPaginatedResponse(
            result.items.map((breeder) =>
                this.breederVerificationAdminPendingBreederListPresentationService.toResponse(breeder),
            ),
            pageNumber,
            itemsPerPage,
            result.total,
        );
    }
}
